'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  TrendingUp,
  Bell,
  Zap,
  Film,
  Tv,
} from 'lucide-react';

export function LiveStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Gagal mengambil data');
      const data = await res.json();
      setStats(data);
      setLastRefresh(new Date());
      
      const newNotifications = [];
      const sources = [
        { key: 'anime', label: 'Anime', icon: '🎌' },
        { key: 'donghua', label: 'Donghua', icon: '✨' },
        { key: 'komik', label: 'Komik', icon: '📚' },
        { key: 'movie', label: 'Movie', icon: '🎬' },
      ];

      sources.forEach(({ key, label }) => {
        const source = data[key];
        if (source?.status === 'online' && source.total > 0) {
          newNotifications.push({
            id: `${key}-${Date.now()}`,
            title: `${label} Update`,
            message: `${source.total} konten ${label.toLowerCase()} tersedia`,
            time: new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }),
            source: label,
            type: 'update',
          });
        }
      });

      if (data.total > 100) {
        newNotifications.unshift({
          id: `trending-${Date.now()}`,
          title: '🔥 Trending',
          message: `${data.total} total konten tersedia di platform!`,
          time: new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' }),
          source: 'AETHRA',
          type: 'trending',
        });
      }
      
      setNotifications(newNotifications.slice(0, 5));
      setUnreadCount(newNotifications.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const scraperConfig = {
    anime: { icon: <Sparkles className="w-4 h-4" />, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20', label: 'Anime' },
    donghua: { icon: <Tv className="w-4 h-4" />, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'Donghua' },
    komik: { icon: <BookOpen className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Komik' },
    movie: { icon: <Film className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Movie' },
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4 border border-[#2a2a2a]/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-[#d4a847]" />
            <h2 className="font-heading text-lg font-bold text-[#f5f0e8]">Live Stats</h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a847] animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-1.5 rounded-lg hover:bg-[#d4a847]/10">
              <Bell className="w-4 h-4 text-[#8a8278]" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a847] rounded-full text-[8px] text-[#0a0a0a] flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={fetchStats} disabled={loading} className="p-1.5 rounded-lg hover:bg-[#d4a847]/10 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 text-[#8a8278] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-4"><p className="text-error text-sm">{error}</p><button onClick={fetchStats} className="mt-2 text-[#d4a847] text-sm hover:underline">Coba lagi</button></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {stats && Object.entries(scraperConfig).map(([key, config]) => {
              const data = stats[key];
              const isOnline = data?.status === 'online';
              return (
                <div key={key} className={`rounded-lg p-2 border ${config.border} ${config.bg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5"><span className={config.color}>{config.icon}</span><span className="text-xs font-medium text-[#f5f0e8]">{config.label}</span></div>
                    <div className="flex items-center gap-1">{isOnline ? <Wifi className="w-2 h-2 text-[#d4a847]" /> : <WifiOff className="w-2 h-2 text-[#8a8278]" />}</div>
                  </div>
                  <div className="flex items-end justify-between"><p className="text-lg font-bold text-[#f5f0e8] font-mono">{loading ? '...' : data?.total || 0}</p></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
