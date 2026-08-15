'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Film,
  BookOpen,
  Sparkles,
  Flame,
  Crown,
  Tv,
  Clock,
  Zap,
  Globe,
  Search,
  Info,
  Shield,
  Settings,
  Code,
} from 'lucide-react';
import { ScraperCard } from '@/components/ScraperCard';
import { SearchBar } from '@/components/SearchBar';
import { LiveStats } from '@/components/LiveStats';
import { LogoGold } from '@/components/Logo';
import { GlassCard } from '@/components/GlassCard';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useBookmark } from '@/hooks/useBookmark';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const scraperFeatures = [
  {
    id: 'anime',
    name: 'Anime',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'Anime subtitle Indonesia terlengkap',
    color: 'from-pink-500 to-rose-400',
    path: '/dashboard/anime',
    stats: 'Live',
  },
  {
    id: 'donghua',
    name: 'Donghua',
    icon: <Tv className="w-6 h-6" />,
    description: 'Anime China terbaru dengan subtitle Indonesia',
    color: 'from-amber-500 to-red-600',
    path: '/dashboard/donghua',
    stats: 'Live',
  },
  {
    id: 'komik',
    name: 'Komik',
    icon: <BookOpen className="w-6 h-6" />,
    description: 'Komik, manga, dan manhwa digital',
    color: 'from-emerald-500 to-teal-400',
    path: '/dashboard/komik',
    stats: 'Live',
  },
  {
    id: 'movie',
    name: 'Movie',
    icon: <Film className="w-6 h-6" />,
    description: 'Film & drama subtitle Indonesia',
    color: 'from-red-500 to-orange-400',
    path: '/dashboard/movie',
    stats: 'Live',
  },
];

const quickAccess = [
  { label: 'Anime', icon: <Sparkles className="w-4 h-4" />, color: 'text-pink-400', path: '/dashboard/anime' },
  { label: 'Donghua', icon: <Tv className="w-4 h-4" />, color: 'text-amber-400', path: '/dashboard/donghua' },
  { label: 'Komik', icon: <BookOpen className="w-4 h-4" />, color: 'text-emerald-400', path: '/dashboard/komik' },
  { label: 'Movie', icon: <Film className="w-4 h-4" />, color: 'text-red-400', path: '/dashboard/movie' },
];

const guideItems = [
  { icon: <Zap className="w-4 h-4" />, text: 'Klik kartu di bawah untuk menjelajahi konten' },
  { icon: <Search className="w-4 h-4" />, text: 'Gunakan pencarian untuk menemukan judul favorit' },
  { icon: <Globe className="w-4 h-4" />, text: 'Jelajahi 4 sumber konten: Anime, Donghua, Komik, Movie' },
  { icon: <Shield className="w-4 h-4" />, text: 'Akses Premium untuk pengalaman tanpa iklan' },
  { icon: <Info className="w-4 h-4" />, text: 'Data diperbarui secara real-time setiap 30 detik' },
  { icon: <Crown className="w-4 h-4" />, text: 'Dukung pengembang dengan berlangganan Premium' },
];

const quickLinks = [
  { label: 'Info Platform', icon: <Info className="w-4 h-4" />, path: '/dashboard/info' },
  { label: 'Info Developer', icon: <Code className="w-4 h-4" />, path: '/dashboard/developer' },
  { label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/dashboard/settings' },
];

export default function DashboardHome() {
  const router = useRouter();
  const { history } = useWatchHistory();
  const { bookmarks } = useBookmark();
  const [trendingItems, setTrendingItems] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalContent, setTotalContent] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchTrending = useCallback(async () => {
    try {
      let allItems = [];
      const animeRes = await fetch('/api/scraper?source=anime&type=home');
      if (animeRes.ok) {
        const data = await animeRes.json();
        const items = data?.data?.items || data?.items || [];
        if (items.length > 0) allItems = [...allItems, ...items.slice(0, 3)];
      }
      const donghuaRes = await fetch('/api/scraper?source=donghua&type=home&page=1');
      if (donghuaRes.ok) {
        const data = await donghuaRes.json();
        const items = data?.data?.items || data?.items || [];
        if (items.length > 0) allItems = [...allItems, ...items.slice(0, 3)];
      }
      const komikRes = await fetch('/api/scraper?source=komik&type=home');
      if (komikRes.ok) {
        const data = await komikRes.json();
        const items = data?.data?.popular || data?.items || [];
        if (items.length > 0) allItems = [...allItems, ...items.slice(0, 2)];
      }
      const movieRes = await fetch('/api/scraper?source=movie&type=home&page=1');
      if (movieRes.ok) {
        const data = await movieRes.json();
        const items = data?.items || [];
        if (items.length > 0) allItems = [...allItems, ...items.slice(0, 2)];
      }
      const shuffled = allItems.sort(() => Math.random() - 0.5);
      setTrendingItems(shuffled.slice(0, 5));
    } catch (e) {}
  }, []);

  const fetchTotal = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setTotalContent(data.total || 0);
        setLastUpdate(data.updatedAt || null);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchTrending();
    fetchTotal();
  }, [fetchTrending, fetchTotal]);

  useEffect(() => {
    if (trendingItems.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % trendingItems.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [trendingItems]);

  const handleSearch = useCallback((query) => {
    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
  }, [router]);

  const handleTrendingClick = useCallback((item) => {
    const url = item.link || item.url;
    if (!url) return;
    const slug = url.split('/').filter(Boolean).pop() || '';
    if (url.includes('donghub')) router.push(`/dashboard/donghua/${slug}`);
    else if (url.includes('samehadaku')) router.push(`/dashboard/anime/${slug}`);
    else if (url.includes('komikindo')) router.push(`/dashboard/komik/${slug}`);
    else if (url.includes('filem21') || url.includes('movie')) router.push(`/dashboard/movie/${slug}`);
    else router.push(`/dashboard/anime/${slug}`);
  }, [router]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl glass-gold p-8 md:p-12 border border-[#d4a847]/20 shadow-[0_0_60px_rgba(212,168,71,0.08)] hover:shadow-[0_0_80px_rgba(212,168,71,0.12)] transition-shadow duration-500"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <LogoGold />
          </motion.div>
          <motion.p
            className="text-lg md:text-xl text-[#8a8278] max-w-2xl mt-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Platform streaming premium dengan koleksi anime, donghua, komik, dan movie terbaik
          </motion.p>
          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {quickAccess.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => router.push(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#2a2a2a]/50 hover:border-[#d4a847]/50 transition-all duration-300 ${item.color} hover:shadow-[0_0_30px_rgba(212,168,71,0.1)]`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#d4a847]/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#d4a847]/5 rounded-full blur-3xl animate-pulse-slow animation-delay-500" />
      </motion.section>

      <motion.div variants={itemVariants}>
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <LiveStats />
      </motion.div>

      {trendingItems.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="glass-gold rounded-2xl p-6 border border-[#d4a847]/20 shadow-[0_0_30px_rgba(212,168,71,0.05)] hover:shadow-[0_0_50px_rgba(212,168,71,0.08)] transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#d4a847] fill-[#d4a847]" />
              Trending Sekarang
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#8a8278]">
              <Clock className="w-3 h-3 text-[#d4a847]" />
              <span>Live Update</span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-[#0a0a0a]/50 border border-[#d4a847]/10">
            <div className="p-6">
              {trendingItems.map((item, index) => (
                <motion.div
                  key={item.link || item.url || index}
                  className={`flex items-center justify-between cursor-pointer ${index !== currentSlide ? 'hidden' : ''}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: index === currentSlide ? 1 : 0, x: index === currentSlide ? 0 : 20 }}
                  transition={{ duration: 0.5 }}
                  onClick={() => handleTrendingClick(item)}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-shrink-0">
                      {item.poster || item.thumbnail || item.image ? (
                        <img src={item.poster || item.thumbnail || item.image} alt={item.title} className="w-16 h-20 rounded-lg object-cover border border-[#d4a847]/30 shadow-[0_0_20px_rgba(212,168,71,0.1)]" />
                      ) : (
                        <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-[#d4a847]/20 to-[#b8942e]/20 flex items-center justify-center border border-[#d4a847]/30">
                          <Sparkles className="w-6 h-6 text-[#d4a847]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-[#f5f0e8] truncate">{item.title || 'Unknown'}</h3>
                      <div className="flex items-center gap-3 text-sm text-[#8a8278] mt-1">
                        {item.episode && <span>Ep {item.episode}</span>}
                        {item.type && <span>• {item.type}</span>}
                        {item.status && <span className="text-[#d4a847]">{item.status}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 hidden sm:block">
                      <button className="px-4 py-2 rounded-lg bg-[#d4a847]/20 text-[#d4a847] text-sm hover:bg-[#d4a847]/30 transition-colors border border-[#d4a847]/20" onClick={(e) => { e.stopPropagation(); handleTrendingClick(item); }}>
                        Tonton
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center gap-1.5 pb-4">
              {trendingItems.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-[#d4a847] shadow-[0_0_10px_rgba(212,168,71,0.5)]' : 'bg-[#8a8278]/30'}`} />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {scraperFeatures.map((scraper) => (
          <motion.div key={scraper.id} variants={itemVariants}>
            <ScraperCard {...scraper} onClick={() => router.push(scraper.path)} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="glass-gold rounded-2xl p-6 border border-[#d4a847]/20 shadow-[0_0_40px_rgba(212,168,71,0.05)] hover:shadow-[0_0_60px_rgba(212,168,71,0.08)] transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#d4a847]/20 border border-[#d4a847]/30 flex items-center justify-center shadow-[0_0_30px_rgba(212,168,71,0.15)]">
              <Crown className="w-5 h-5 text-[#d4a847]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#f5f0e8]">AETHRA STREAM Premium</h3>
              <p className="text-sm text-[#8a8278]">Akses semua konten tanpa batas</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30">Anime</span>
            <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">Donghua</span>
            <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Komik</span>
            <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">Movie</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-gold rounded-2xl p-6 border border-[#d4a847]/20 shadow-[0_0_40px_rgba(212,168,71,0.05)] hover:shadow-[0_0_60px_rgba(212,168,71,0.08)] transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#d4a847]/20 border border-[#d4a847]/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#d4a847]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#f5f0e8]">Panduan & Rules</h3>
              <p className="text-sm text-[#8a8278]">Kenali platform dan mulai jelajahi</p>
            </div>
          </div>
          <div className="space-y-2">
            {guideItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 hover:bg-[#d4a847]/5 transition-colors">
                <span className="text-[#d4a847]">{item.icon}</span>
                <span className="text-sm text-[#f5f0e8]">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="glass-gold rounded-2xl p-4 border border-[#d4a847]/20 shadow-[0_0_40px_rgba(212,168,71,0.05)] hover:shadow-[0_0_60px_rgba(212,168,71,0.08)] transition-shadow duration-300">
          <h3 className="font-heading text-sm font-bold text-[#f5f0e8] mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#d4a847]" />
            Akses Cepat
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link, idx) => (
              <button key={idx} onClick={() => router.push(link.path)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] hover:border-[#d4a847]/30 hover:bg-[#d4a847]/5 transition-colors">
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-gold rounded-2xl p-4 border border-[#d4a847]/20 shadow-[0_0_40px_rgba(212,168,71,0.05)] hover:shadow-[0_0_60px_rgba(212,168,71,0.08)] transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#8a8278]">
              <Clock className="w-4 h-4 text-[#d4a847]" />
              <span>Real-time Update</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#8a8278]">Total:</span>
              <span className="font-bold text-[#d4a847]">{totalContent}</span>
              <span className="text-[#8a8278]">Konten</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-[#8a8278]">
            <span>v1.0.0 • Active</span>
            {lastUpdate && <span>Update: {new Date(lastUpdate).toLocaleTimeString('id-ID')}</span>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
