'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, Search, Clock, Star, Flame, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { GlassCard } from '@/components/GlassCard';

const DAY_MAP = {
  'monday': 'Senin',
  'tuesday': 'Selasa',
  'wednesday': 'Rabu',
  'thursday': 'Kamis',
  'friday': 'Jumat',
  'saturday': 'Sabtu',
  'sunday': 'Minggu',
};

export default function DonghuaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [schedule, setSchedule] = useState({});
  const [slider, setSlider] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recommendation, setRecommendation] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const tabs = [
    { id: 'home', label: 'Beranda', icon: Flame },
    { id: 'ongoing', label: 'Ongoing', icon: Clock },
    { id: 'completed', label: 'Completed', icon: Star },
    { id: 'schedule', label: 'Jadwal', icon: Calendar },
  ];

  const cleanTitle = (title) => {
    if (!title) return 'Judul Tidak Diketahui';
    let cleaned = title;
    cleaned = cleaned.replace(/Episode\s*\d+\s*Subtitle\s*Indonesia/gi, '').trim();
    cleaned = cleaned.replace(/Ep\s*\d+/gi, '').trim();
    cleaned = cleaned.replace(/Subtitle\s*Indonesia/gi, '').trim();
    cleaned = cleaned.replace(/\s*ONA\s*$/i, '').trim();
    const words = cleaned.split(/\s+/);
    if (words.length > 3) {
      const half = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, half).join(' ');
      const secondHalf = words.slice(half).join(' ');
      if (firstHalf === secondHalf) cleaned = firstHalf;
    }
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 50) cleaned = cleaned.slice(0, 50) + '...';
    return cleaned || 'Judul Tidak Diketahui';
  };

  const cleanEpisode = (episode) => {
    if (!episode) return null;
    let cleaned = String(episode);
    cleaned = cleaned.replace(/Ep\s*isode/gi, '').trim();
    cleaned = cleaned.replace(/^Ep\s*/i, '').trim();
    cleaned = cleaned.replace(/^Episode\s*/i, '').trim();
    cleaned = cleaned.replace(/\s*ONA\s*$/i, '').trim();
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 20) cleaned = cleaned.slice(0, 20) + '...';
    return cleaned || null;
  };

  const cleanType = (type) => {
    if (!type) return null;
    let cleaned = String(type);
    cleaned = cleaned.replace(/\s*ONA\s*$/i, '').trim();
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned || null;
  };

  const fetchData = async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      let url;
      if (activeTab === 'home') {
        url = `/api/scraper?source=donghua&type=home&page=${pageNum}`;
      } else if (activeTab === 'search' && searchQuery.trim()) {
        url = `/api/scraper?source=donghua&type=search&query=${encodeURIComponent(searchQuery.trim())}&page=${pageNum}`;
      } else if (activeTab === 'ongoing') {
        url = `/api/scraper?source=donghua&type=ongoing&page=${pageNum}`;
      } else if (activeTab === 'completed') {
        url = `/api/scraper?source=donghua&type=completed&page=${pageNum}`;
      } else if (activeTab === 'schedule') {
        url = `/api/scraper?source=donghua&type=schedule`;
      } else {
        url = `/api/scraper?source=donghua&type=${activeTab}&page=${pageNum}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal mengambil data');
      const json = await res.json();

      if (activeTab === 'schedule') {
        const raw = json?.data?.schedule || {};
        const converted = {};
        Object.keys(DAY_MAP).forEach(day => {
          if (raw[day]) converted[DAY_MAP[day]] = raw[day];
        });
        setSchedule(converted);
        setItems([]);
        setSlider([]);
        setPopular([]);
        setRecommendation({});
        setHasNext(false);
        setTotalPages(0);
      } else if (activeTab === 'home') {
        const data = json?.data || {};
        setSlider(data.slider || []);
        setPopular(data.popular || []);
        setRecommendation(data.recommendation || {});
        const latest = data.latest || [];
        const pagination = data.pagination || {};
        if (append) {
          setItems(prev => [...prev, ...latest]);
        } else {
          setItems(latest);
        }
        setSchedule({});
        setHasNext(pagination.hasNext || false);
        setTotalPages(pagination.total || 0);
      } else {
        let extracted = [];
        let pagination = null;
        if (json.data && json.data.items) {
          extracted = json.data.items;
          pagination = json.data.pagination;
        } else if (json.items) {
          extracted = json.items;
          pagination = json.pagination;
        }
        if (append) {
          setItems(prev => [...prev, ...extracted]);
        } else {
          setItems(extracted);
        }
        setSlider([]);
        setPopular([]);
        setRecommendation({});
        setSchedule({});
        if (pagination) {
          setHasNext(pagination.hasNext || false);
          setTotalPages(pagination.total || 0);
        } else {
          setHasNext(extracted.length >= 20);
        }
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
    if (slug) router.push(`/dashboard/donghua/${slug}`);
  };

  if (loading && items.length === 0 && activeTab !== 'home') return <SkeletonLoader type="card" count={30} />;

  if (activeTab === 'schedule') {
    if (Object.keys(schedule).length === 0) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold gold-glow-text flex items-center gap-3">
                <Calendar className="w-7 h-7 text-yellow-500" />
                Jadwal Donghua
              </h1>
              <p className="text-[#8a8278] text-sm mt-1">Jadwal tayang donghua setiap hari</p>
            </div>
          </div>
          <div className="text-center py-12 glass rounded-2xl border border-[#2a2a2a]/50">
            <Calendar className="w-16 h-16 text-[#8a8278] mx-auto mb-4" />
            <p className="text-[#8a8278]">Belum ada jadwal tersedia</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold gold-glow-text flex items-center gap-3">
              <Calendar className="w-7 h-7 text-yellow-500" />
              Jadwal Donghua
            </h1>
            <p className="text-[#8a8278] text-sm mt-1">Jadwal tayang donghua setiap hari</p>
          </div>
        </div>
        <div className="space-y-6">
          {Object.entries(schedule).map(([day, items]) => (
            <GlassCard key={day} className="p-4">
              <h2 className="font-heading text-lg font-bold text-[#f5f0e8] flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-500" />
                {day}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {items.slice(0, 6).map((item, index) => (
                  <div
                    key={`${item.url}-${index}`}
                    onClick={() => handleItemClick(item.url)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 cursor-pointer hover:border-yellow-500/30 hover:bg-[#0a0a0a]/70 transition-all duration-300"
                  >
                    {item.poster ? (
                      <img src={item.poster} alt={cleanTitle(item.title)} className="w-12 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-16 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                        <Tv className="w-6 h-6 text-[#8a8278]" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-[#f5f0e8] line-clamp-2">{cleanTitle(item.title)}</h3>
                      {item.episode && <p className="text-xs text-[#8a8278]">Ep {cleanEpisode(item.episode)}</p>}
                      {item.sub && <p className="text-xs text-[#8a8278]">Sub {item.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'home') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold gold-glow-text flex items-center gap-3">
              <Tv className="w-7 h-7 text-yellow-500" />
              Donghua
            </h1>
            <p className="text-[#8a8278] text-sm mt-1">Anime China dengan subtitle Indonesia</p>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[#141414]/80 rounded-xl px-4 py-2 border border-[#2a2a2a]/40 flex-1 md:flex-none md:w-64 lg:w-72">
            <Search className="w-4 h-4 text-[#8a8278] flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari donghua..."
              className="bg-transparent outline-none text-sm text-[#f5f0e8] placeholder:text-[#8a8278] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="text-xs px-3 py-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors border border-yellow-400/20">
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
                  ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                  : 'text-[#8a8278] hover:text-[#f5f0e8] hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {slider.length > 0 && (
          <div className="relative rounded-xl overflow-hidden glass border border-[#2a2a2a]/50">
            <div className="aspect-[16/9] md:aspect-[16/6] relative">
              {slider.slice(0, 1).map((slide, idx) => (
                <div key={idx} className="w-full h-full relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.backdrop})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <h2 className="font-heading text-2xl md:text-4xl font-bold text-[#f5f0e8] mb-2">
                      {slide.title}
                    </h2>
                    <p className="text-[#8a8278] text-sm md:text-base line-clamp-2 mb-4 max-w-2xl">
                      {slide.synopsis}
                    </p>
                    <button
                      onClick={() => handleItemClick(slide.url)}
                      className="px-6 py-2 rounded-lg bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border border-yellow-500/30 transition-colors text-sm font-medium"
                    >
                      Tonton Sekarang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {popular.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <Flame className="w-5 h-5 text-yellow-500" />
              Populer Hari Ini
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {popular.map((item, index) => (
                <div
                  key={`${item.url}-${index}`}
                  className="group cursor-pointer"
                  onClick={() => handleItemClick(item.url)}
                >
                  <div className="card hover:border-yellow-500/50 transition-all duration-300">
                    <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                      {item.poster ? (
                        <img src={item.poster} alt={cleanTitle(item.title)} className="card-image" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-yellow-500/5">
                          <Tv className="w-8 h-8 text-[#8a8278]" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent">
                        {item.episode && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/80 text-[10px] font-bold text-white shadow-lg">
                            Ep {cleanEpisode(item.episode)}
                          </span>
                        )}
                        {cleanType(item.type) && (
                          <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-blue-500/80 text-[10px] font-bold text-white">
                            {cleanType(item.type)}
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

        {items.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Rilis Terbaru
            </h2>
            <GlassCard className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {items.map((item, index) => (
                  <div
                    key={`${item.url}-${index}`}
                    className="group cursor-pointer"
                    onClick={() => handleItemClick(item.url)}
                  >
                    <div className="card hover:border-yellow-500/50 transition-all duration-300">
                      <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                        {item.poster ? (
                          <img src={item.poster} alt={cleanTitle(item.title)} className="card-image" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-yellow-500/5">
                            <Tv className="w-8 h-8 text-[#8a8278]" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent">
                          {item.episode && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/80 text-[10px] font-bold text-white shadow-lg">
                              Ep {cleanEpisode(item.episode)}
                            </span>
                          )}
                          {cleanType(item.type) && (
                            <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-blue-500/80 text-[10px] font-bold text-white">
                              {cleanType(item.type)}
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
          </div>
        )}

        {Object.keys(recommendation).length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#2a2a2a]/50">
            <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Rekomendasi
            </h2>
            {Object.entries(recommendation).map(([key, items]) => (
              <div key={key} className="space-y-2">
                <h3 className="text-sm font-medium text-[#8a8278]">{key.replace('series-', 'Genre: ')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {items.slice(0, 6).map((item, index) => (
                    <div
                      key={`${item.url}-${index}`}
                      className="group cursor-pointer"
                      onClick={() => handleItemClick(item.url)}
                    >
                      <div className="card hover:border-yellow-500/50 transition-all duration-300">
                        <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                          {item.poster ? (
                            <img src={item.poster} alt={cleanTitle(item.title)} className="card-image" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-yellow-500/5">
                              <Tv className="w-8 h-8 text-[#8a8278]" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent">
                            {item.episode && (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/80 text-[10px] font-bold text-white shadow-lg">
                                {item.episode}
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
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <EmptyState icon="tv" title="Tidak ada donghua" description="Belum ada donghua yang tersedia" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold gold-glow-text flex items-center gap-3">
            <Tv className="w-7 h-7 text-yellow-500" />
            Donghua
          </h1>
          <p className="text-[#8a8278] text-sm mt-1">Anime China dengan subtitle Indonesia</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-[#141414]/80 rounded-xl px-4 py-2 border border-[#2a2a2a]/40 flex-1 md:flex-none md:w-64 lg:w-72">
          <Search className="w-4 h-4 text-[#8a8278] flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari donghua..."
            className="bg-transparent outline-none text-sm text-[#f5f0e8] placeholder:text-[#8a8278] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="text-xs px-3 py-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors border border-yellow-400/20">
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
                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
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
              <div className="card hover:border-yellow-500/50 transition-all duration-300">
                <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                  {item.poster ? (
                    <img src={item.poster} alt={cleanTitle(item.title)} className="card-image" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-yellow-500/5">
                      <Tv className="w-8 h-8 text-[#8a8278]" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-[#0a0a0a]/90 to-transparent">
                    {item.episode && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-500/80 text-[10px] font-bold text-white shadow-lg">
                        Ep {cleanEpisode(item.episode)}
                      </span>
                    )}
                    {cleanType(item.type) && (
                      <span className="inline-block ml-1 px-2 py-0.5 rounded-full bg-blue-500/80 text-[10px] font-bold text-white">
                        {cleanType(item.type)}
                      </span>
                    )}
                  </div>
                  {item.rating && item.rating !== '0' && item.rating !== '' && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-sm border border-yellow-500/30">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-[#f5f0e8] font-medium">{item.rating}</span>
                    </div>
                  )}
                  {item.sub && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#0a0a0a]/80 text-[9px] text-[#8a8278]">
                      {item.sub}
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
            className="p-2 rounded-lg border border-[#2a2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-500/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-yellow-500" />
          </button>
          <span className="text-sm text-[#8a8278]">Halaman {page} dari {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-[#2a2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-500/50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-yellow-500" />
          </button>
        </div>
      )}
    </div>
  );
}
