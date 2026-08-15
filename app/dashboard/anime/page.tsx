'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Search, Clock, Star, Flame, Calendar, Layers, Tv } from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { GlassCard } from '@/components/GlassCard';

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

function cleanTitle(title: string): string {
  if (!title) return 'Judul Tidak Diketahui';
  let cleaned = title;
  cleaned = cleaned.replace(/Sub\s*Indo/gi, '').trim();
  cleaned = cleaned.replace(/Subtitle\s*Indonesia/gi, '').trim();
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length > 50) cleaned = cleaned.slice(0, 50) + '...';
  return cleaned || 'Judul Tidak Diketahui';
}

export default function AnimePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('terbaru');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [top10, setTop10] = useState([]);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const tabs = [
    { id: 'terbaru', label: 'Terbaru', icon: Flame },
    { id: 'ongoing', label: 'Ongoing', icon: Clock },
    { id: 'completed', label: 'Completed', icon: Star },
    { id: 'batch', label: 'Batch', icon: Layers },
    { id: 'movie', label: 'Movie', icon: Tv },
  ];

  const fetchData = async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      let url;
      if (activeTab === 'search' && searchQuery.trim()) {
        url = `/api/scraper?source=anime&type=search&query=${encodeURIComponent(searchQuery.trim())}&page=${pageNum}`;
      } else if (activeTab === 'terbaru') {
        url = `/api/scraper?source=anime&type=terbaru&page=${pageNum}`;
      } else if (activeTab === 'ongoing') {
        url = `/api/scraper?source=anime&type=ongoing&page=${pageNum}`;
      } else if (activeTab === 'completed') {
        url = `/api/scraper?source=anime&type=completed&page=${pageNum}`;
      } else if (activeTab === 'batch') {
        url = `/api/scraper?source=anime&type=batch&page=${pageNum}`;
      } else if (activeTab === 'movie') {
        url = `/api/scraper?source=anime&type=movie&page=${pageNum}`;
      } else {
        url = `/api/scraper?source=anime&type=catalog&page=${pageNum}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal mengambil data');
      const json = await res.json();

      let extracted = [];
      let pagination = null;

      if (json.data && json.data.items) {
        extracted = json.data.items;
        pagination = json.data.pagination;
      } else if (json.data && json.data.schedule) {
        extracted = json.data.schedule;
      } else if (json.items) {
        extracted = json.items;
        pagination = json.pagination;
      } else if (Array.isArray(json.data)) {
        extracted = json.data;
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

  const fetchTop10 = async () => {
    try {
      const res = await fetch('/api/scraper?source=anime&type=home&page=1');
      if (!res.ok) return;
      const json = await res.json();
      if (json.data && json.data.top10) {
        setTop10(json.data.top10);
      }
    } catch (e) {}
  };

  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchData(1);
    if (activeTab === 'terbaru') fetchTop10();
  }, [activeTab]);

  useEffect(() => {
    if (page > 1) {
      fetchData(page, true);
    }
  }, [page]);

  useEffect(() => {
    if (!hasNext || loadingMore || loading || activeTab === 'schedule') return;
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
    if (!url) return;
    const slug = url.split('/').filter(Boolean).pop() || '';
    if (slug) router.push(`/dashboard/anime/${slug}`);
  };

  if (loading && items.length === 0) return <SkeletonLoader type="card" count={30} />;
  if (error) return <ErrorState message={error} onRetry={() => fetchData(1)} />;
  if (!items || items.length === 0) {
    return <EmptyState icon="film" title="Tidak ada anime" description="Belum ada anime yang tersedia" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold gold-glow-text flex items-center gap-3">
            <Film className="w-7 h-7 text-pink-400" />
            Anime
          </h1>
          <p className="text-[#8a8278] text-sm mt-1">Anime subtitle Indonesia terlengkap</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[#141414]/80 rounded-xl px-4 py-2 border border-[#2a2a2a]/40 flex-1 md:flex-none md:w-64 lg:w-72">
          <Search className="w-4 h-4 text-[#8a8278] flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari anime..."
            className="bg-transparent outline-none text-sm text-[#f5f0e8] placeholder:text-[#8a8278] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="text-xs px-3 py-1 rounded bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors border border-pink-400/20">
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
                ? 'bg-pink-400/20 text-pink-400 border border-pink-400/30'
                : 'text-[#8a8278] hover:text-[#f5f0e8] hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'terbaru' && top10.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
            <Flame className="w-5 h-5 text-pink-400" />
            Top 10 Minggu Ini
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {top10.slice(0, 10).map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="group cursor-pointer"
                onClick={() => handleItemClick(item.url)}
              >
                <div className="card hover:border-pink-400/50 transition-all duration-300">
                  <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                    {item.poster ? (
                      <img src={item.poster} alt={cleanTitle(item.title)} className="card-image" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-400/5">
                        <Film className="w-8 h-8 text-[#8a8278]" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-sm">
                      <span className="text-xs font-bold text-pink-400">#{index + 1}</span>
                    </div>
                    {item.rating && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-sm border border-pink-400/30">
                        <Star className="w-3 h-3 text-pink-400 fill-pink-400" />
                        <span className="text-xs text-[#f5f0e8] font-medium">{item.rating}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent">
                      {item.episode && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-pink-500/80 text-[10px] font-bold text-white shadow-lg">
                          {cleanEpisode(item.episode)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-body text-sm font-medium text-[#f5f0e8] line-clamp-2">
                      {cleanTitle(item.title)}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <GlassCard className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {items.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="group cursor-pointer"
              onClick={() => handleItemClick(item.url)}
            >
              <div className="card hover:border-pink-400/50 transition-all duration-300">
                <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                  {item.poster ? (
                    <img src={item.poster} alt={cleanTitle(item.title)} className="card-image" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pink-400/5">
                      <Film className="w-8 h-8 text-[#8a8278]" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent">
                    {item.episode && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-pink-500/80 text-[10px] font-bold text-white shadow-lg">
                        {cleanEpisode(item.episode)}
                      </span>
                    )}
                    {item.type && (
                      <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-blue-500/80 text-[10px] font-bold text-white">
                        {item.type}
                      </span>
                    )}
                  </div>
                  {item.rating && item.rating !== '0' && item.rating !== '' && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-sm border border-pink-400/30">
                      <Star className="w-3 h-3 text-pink-400 fill-pink-400" />
                      <span className="text-xs text-[#f5f0e8] font-medium">{item.rating}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-body text-sm font-medium text-[#f5f0e8] line-clamp-2">
                    {cleanTitle(item.title)}
                  </h3>
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

      {hasNext && activeTab !== 'schedule' && (
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
    </div>
  );
}