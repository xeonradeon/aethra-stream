'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Flame, Search, Star, ChevronLeft, ChevronRight, Sparkles, Tv, Film } from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { GlassCard } from '@/components/GlassCard';

export default function KomikPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const tabs = [
    { id: 'home', label: 'Beranda', icon: Flame },
    { id: 'terbaru', label: 'Terbaru', icon: Clock },
    { id: 'populer', label: 'Populer', icon: Star },
    { id: 'manhwa', label: 'Manhwa', icon: Sparkles },
    { id: 'manga', label: 'Manga', icon: BookOpen },
    { id: 'manhua', label: 'Manhua', icon: Tv },
    { id: 'berwarna', label: 'Berwarna', icon: Film },
  ];

  const fetchData = async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      let url;
      if (activeTab === 'home') {
        url = `/api/scraper?source=komik&type=home`;
      } else if (activeTab === 'search' && searchQuery.trim()) {
        url = `/api/scraper?source=komik&type=search&query=${encodeURIComponent(searchQuery.trim())}&page=${pageNum}`;
      } else {
        url = `/api/scraper?source=komik&type=${activeTab}&page=${pageNum}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal mengambil data');
      const json = await res.json();

      let extracted = [];
      let pagination = null;

      if (activeTab === 'home') {
        const popular = json?.data?.popular || [];
        const latest = json?.data?.latest || [];
        const allItems = [...popular, ...latest];
        const seen = new Set();
        extracted = allItems.filter(item => {
          const key = item.url;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      } else {
        extracted = json?.data?.items || [];
        pagination = json?.data?.pagination;
      }

      if (append) {
        setItems(prev => [...prev, ...extracted]);
      } else {
        setItems(extracted);
      }

      if (pagination) {
        setHasNext(pagination.hasNext || false);
        setTotalPages(pagination.total || 0);
      } else {
        setHasNext(extracted.length >= 20);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [activeTab]);

  useEffect(() => {
    if (page > 1 && activeTab !== 'home') {
      fetchData(page, true);
    }
  }, [page]);

  useEffect(() => {
    if (!hasNext || loadingMore || loading || activeTab === 'home') return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNext, loadingMore, loading, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('search');
      setPage(1);
      fetchData(1);
    }
  };

  const handleItemClick = (url) => {
    const slug = url?.split('/').filter(Boolean).pop() || '';
    if (slug) {
      router.push(`/dashboard/komik/${slug}`);
    }
  };

  if (loading && items.length === 0) return <SkeletonLoader type="card" count={8} />;
  if (error) return <ErrorState message={error} onRetry={() => fetchData(1)} />;
  if (!items || items.length === 0) {
    return <EmptyState icon="book" title="Tidak ada komik" description="Belum ada komik yang tersedia" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold gold-glow-text flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            Komik
          </h1>
          <p className="text-[#8a8278] text-sm mt-1">Komik, Manga, dan Manhwa digital</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[#141414]/80 rounded-xl px-4 py-2 border border-[#2a2a2a]/40 flex-1 md:flex-none md:w-64 lg:w-72">
          <Search className="w-4 h-4 text-[#8a8278] flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari komik..."
            className="bg-transparent outline-none text-sm text-[#f5f0e8] placeholder:text-[#8a8278] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="text-xs px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-400/20">
            Cari
          </button>
        </form>
      </div>

      <div className="flex gap-2 p-1 rounded-xl glass border border-[#2a2a2a]/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                : 'text-[#8a8278] hover:text-[#f5f0e8] hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <GlassCard className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {items.map((item, index) => (
            <div
              key={`${item.url || item.link}-${index}`}
              className="group cursor-pointer"
              onClick={() => handleItemClick(item.url || item.link)}
            >
              <div className="card hover:border-emerald-400/50 transition-all duration-300 relative">
                <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                  {item.poster || item.thumbnail || item.image ? (
                    <img
                      src={item.poster || item.thumbnail || item.image}
                      alt={item.title}
                      className="card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-400/5">
                      <BookOpen className="w-8 h-8 text-[#8a8278]" />
                    </div>
                  )}
                  {item.rating && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-sm">
                      <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                      <span className="text-xs text-[#f5f0e8]">{item.rating}</span>
                    </div>
                  )}
                  {item.type && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 text-[10px]">
                      {item.type}
                    </div>
                  )}
                  {item.color && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[10px]">
                      {item.color}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="font-body text-xs font-medium text-[#f5f0e8] line-clamp-2">
                    {item.title}
                  </h3>
                  {item.latestChapterTitle && (
                    <p className="text-[10px] text-[#8a8278] mt-1">
                      {item.latestChapterTitle}
                    </p>
                  )}
                  {item.status && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        item.status.toLowerCase() === 'ongoing' || item.status.toLowerCase() === 'berjalan' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-[#2a2a2a]/50 text-[#8a8278]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {activeTab !== 'home' && hasNext && (
        <div ref={loadMoreRef} className="py-8 text-center">
          {loadingMore ? (
            <div className="flex items-center justify-center gap-2 text-[#8a8278]">
              <div className="w-4 h-4 border-2 border-[#d4a847] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Memuat lebih banyak...</span>
            </div>
          ) : (
            <span className="text-sm text-[#8a8278]">Scroll untuk memuat lebih banyak</span>
          )}
        </div>
      )}

      {!hasNext && items.length > 0 && activeTab !== 'home' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-[#2a2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-400/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
          </button>
          <span className="text-sm text-[#8a8278]">Halaman {page} dari {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-[#2a2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-400/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}
    </div>
  );
}
