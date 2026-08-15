'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Search, Star, Flame, Clock, Tv, Calendar } from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { GlassCard } from '@/components/GlassCard';

function cleanTitle(title: string): string {
  if (!title) return 'Judul Tidak Diketahui';
  let cleaned = title;
  cleaned = cleaned.replace(/Sub\s*Indo/gi, '').trim();
  cleaned = cleaned.replace(/Subtitle\s*Indonesia/gi, '').trim();
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length > 50) cleaned = cleaned.slice(0, 50) + '...';
  return cleaned || 'Judul Tidak Diketahui';
}

function cleanEpisode(raw: string): string {
  if (!raw) return '';
  let cleaned = String(raw);
  cleaned = cleaned.replace(/Episode/gi, '').trim();
  cleaned = cleaned.replace(/Ep/gi, '').trim();
  cleaned = cleaned.replace(/Eps/gi, '').trim();
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/\d+/);
  if (match) return match[0];
  return cleaned || '';
}

export default function MoviePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const tabs = [
    { id: 'home', label: 'Beranda', icon: Flame },
    { id: 'trending', label: 'Trending', icon: Star },
    { id: 'tv', label: 'Serial TV', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Calendar },
  ];

  const fetchData = async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      let url;
      if (activeTab === 'search' && searchQuery.trim()) {
        url = `/api/scraper?source=movie&type=search&query=${encodeURIComponent(searchQuery.trim())}&page=${pageNum}`;
      } else if (activeTab === 'trending') {
        url = `/api/scraper?source=movie&type=genre&slug=box-office&page=${pageNum}`;
      } else if (activeTab === 'tv') {
        url = `/api/scraper?source=movie&type=genre&slug=serial-tv&page=${pageNum}`;
      } else if (activeTab === 'anime') {
        url = `/api/scraper?source=movie&type=genre&slug=animation&page=${pageNum}`;
      } else {
        url = `/api/scraper?source=movie&type=home&page=${pageNum}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal mengambil data');
      const json = await res.json();

      let extracted = [];
      let pagination = null;

      if (json.data && json.data.items) {
        extracted = json.data.items;
        pagination = json.data.pagination;
      } else if (json.items) {
        extracted = json.items;
        pagination = json.pagination;
      } else if (json.data && Array.isArray(json.data)) {
        extracted = json.data;
      } else if (Array.isArray(json)) {
        extracted = json;
      }

      const unique = [];
      const seen = new Set();
      extracted.forEach(item => {
        const key = item.url || item.link || item.title;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });

      if (append) {
        const newItems = unique.filter(item => {
          const key = item.url || item.link || item.title;
          return !items.some(existing => (existing.url || existing.link || existing.title) === key);
        });
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(unique);
      }

      if (pagination) {
        const total = pagination.total || 0;
        const current = pagination.current || pageNum;
        setHasNext(current < total);
        setTotalPages(total);
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
    setItems([]);
    fetchData(1);
  }, [activeTab]);

  useEffect(() => {
    if (page > 1) fetchData(page, true);
  }, [page]);

  useEffect(() => {
    if (!hasNext || loadingMore || loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [hasNext, loadingMore, loading]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('search');
      setPage(1);
      fetchData(1);
    }
  };

  const handleItemClick = (url) => {
    if (!url) return;
    const slug = url.split('/').filter(Boolean).pop() || '';
    if (slug) router.push(`/dashboard/movie/${slug}`);
  };

  if (loading && items.length === 0) return <SkeletonLoader type="card" count={30} />;
  if (error) return <ErrorState message={error} onRetry={() => fetchData(1)} />;
  if (!items || items.length === 0) {
    return <EmptyState icon="film" title="Tidak ada movie" description="Belum ada movie yang tersedia" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold gold-glow-text flex items-center gap-3">
            <Film className="w-7 h-7 text-red-400" />
            Movie
          </h1>
          <p className="text-[#8a8278] text-sm mt-1">Film & drama subtitle Indonesia</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[#141414]/80 rounded-xl px-4 py-2 border border-[#2a2a2a]/40 flex-1 md:flex-none md:w-64 lg:w-72">
          <Search className="w-4 h-4 text-[#8a8278] flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari movie..."
            className="bg-transparent outline-none text-sm text-[#f5f0e8] placeholder:text-[#8a8278] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-400/20">
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
                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
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
              key={`${item.url}-${index}`}
              className="group cursor-pointer"
              onClick={() => handleItemClick(item.url)}
            >
              <div className="card hover:border-red-400/50 transition-all duration-300">
                <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                  {item.poster ? (
                    <img src={item.poster} alt={cleanTitle(item.title)} className="card-image" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-red-400/5">
                      <Film className="w-8 h-8 text-[#8a8278]" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent">
                    {item.episode && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-red-500/80 text-[10px] font-bold text-white shadow-lg">
                        Ep {cleanEpisode(item.episode)}
                      </span>
                    )}
                    {item.type === 'TV Show' ? (
                      <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-blue-500/80 text-[10px] font-bold text-white">
                        TV
                      </span>
                    ) : item.type === 'Movie' ? (
                      <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-green-500/80 text-[10px] font-bold text-white">
                        Movie
                      </span>
                    ) : item.type && (
                      <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-purple-500/80 text-[10px] font-bold text-white">
                        {item.type}
                      </span>
                    )}
                    {item.quality && (
                      <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-yellow-500/80 text-[10px] font-bold text-white">
                        {item.quality}
                      </span>
                    )}
                  </div>
                  {item.rating && item.rating !== '' && item.rating !== '0' && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-sm border border-red-400/30">
                      <Star className="w-3 h-3 text-red-400 fill-red-400" />
                      <span className="text-xs text-[#f5f0e8] font-medium">{item.rating}</span>
                    </div>
                  )}
                  {item.duration && (
                    <div className="absolute bottom-8 left-2 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-sm">
                      <span className="text-xs text-[#8a8278]">{item.duration}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-body text-sm font-medium text-[#f5f0e8] line-clamp-2">
                    {cleanTitle(item.title)}
                  </h3>
                  {item.type && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-[#8a8278]">
                      <span>{item.type}</span>
                    </div>
                  )}
                  {item.genres_countries && item.genres_countries.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.genres_countries.slice(0, 2).map((g, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-[#2a2a2a]/50 text-[#8a8278]">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.status && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-[#8a8278]">
                      <Clock className="w-3 h-3" />
                      <span>{item.status}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {hasNext && (
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

      {!hasNext && items.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-[#2a2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-400/50 transition-colors"
          >
            <span className="text-[#8a8278]">←</span>
          </button>
          <span className="text-sm text-[#8a8278]">Halaman {page} dari {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-[#2a2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-400/50 transition-colors"
          >
            <span className="text-[#8a8278]">→</span>
          </button>
        </div>
      )}
    </div>
  );
}