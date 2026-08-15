'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Play,
  Star,
  Clock,
  Calendar,
  ChevronLeft,
  List,
  Info,
  Tv,
  Share2,
  Film,
} from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
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

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/scraper?source=anime&type=detail&slug=${slug}`);
        if (!res.ok) throw new Error('Gagal mengambil data');
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  const handleWatch = (episodeUrl) => {
    const slugPart = episodeUrl?.split('/').filter(Boolean).pop() || '';
    if (slugPart) {
      router.push(`/dashboard/anime/watch/${slugPart}`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.data?.title,
          text: `Tonton ${data?.data?.title} di AETHRA STREAM`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link disalin!');
      }
    } catch (e) {}
  };

  if (loading) return <SkeletonLoader type="detail" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data?.data) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-[#8a8278]">Data tidak ditemukan</p>
    </div>
  );

  const { data: anime } = data;
  const rating = anime.rating ? parseFloat(anime.rating) : 0;
  const episodes = anime.episodes || [];
  const displayEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 20);
  const hasMore = episodes.length > 20;
  const info = anime.info || {};
  const genres = anime.genres || [];
  const synopsis = anime.synopsis || 'Sinopsis tidak tersedia.';
  const poster = anime.poster || null;
  const title = anime.title || 'Judul Tidak Diketahui';
  const recommended = anime.recommended || [];

  const latestEpisode = episodes.length > 0 ? episodes[episodes.length - 1] : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Kembali</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="relative rounded-xl overflow-hidden border border-[#2a2a2a]/50 bg-[#141414] shadow-[0_0_20px_rgba(212,168,71,0.05)] aspect-[2/3] max-w-[240px] mx-auto md:mx-0">
            {poster ? (
              <img src={poster} alt={title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-pink-400/5">
                <Tv className="w-12 h-12 text-[#8a8278]" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex gap-1">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#2a2a2a]/50 text-[#8a8278] hover:border-[#d4a847]/50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-5">
          <div className="flex items-start justify-between">
            <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#f5f0e8] leading-tight">
              {title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {rating > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-400/10 border border-pink-400/20 text-pink-400 text-sm">
                <Star className="w-3.5 h-3.5 fill-pink-400" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
            {info.status && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                {info.status}
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2a2a2a]/50 text-[#8a8278] border border-[#2a2a2a]/30">
              {episodes.length} Episode
            </span>
            {info.type && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                {info.type}
              </span>
            )}
            {info.season && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-400/10 text-purple-400 border border-purple-400/20">
                {info.season}
              </span>
            )}
            {info.studio && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                {info.studio}
              </span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-pink-400/10 text-pink-400 border border-pink-400/20"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {synopsis && synopsis !== 'Sinopsis tidak tersedia.' && (
            <div className="glass rounded-xl p-5 border border-[#2a2a2a]/50">
              <h3 className="font-heading text-sm font-bold text-[#f5f0e8] mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#d4a847]" />
                Sinopsis
              </h3>
              <p className="text-[#8a8278] text-sm leading-relaxed whitespace-pre-wrap">
                {synopsis}
              </p>
            </div>
          )}

          {Object.keys(info).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(info).map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30"
                >
                  <span className="text-[10px] uppercase tracking-wider text-[#8a8278] mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className="text-sm text-[#f5f0e8] font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {latestEpisode && (
        <div className="glass rounded-xl p-4 border border-[#2a2a2a]/50 hover:border-pink-400/50 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-[#f5f0e8]">Episode Terbaru</h2>
              <p className="text-sm text-[#8a8278] mt-1">
                Episode {cleanEpisode(latestEpisode.episode)} — {latestEpisode.title || `Episode ${latestEpisode.episode}`}
              </p>
              {latestEpisode.releaseDate && (
                <p className="text-xs text-[#8a8278]/50 mt-0.5">
                  Rilis: {latestEpisode.releaseDate}
                </p>
              )}
            </div>
            <button
              onClick={() => handleWatch(latestEpisode.url)}
              className="px-4 py-2 rounded-lg bg-pink-400/10 text-pink-400 hover:bg-pink-400/20 border border-pink-400/30 transition-colors text-sm font-medium"
            >
              Tonton Sekarang
            </button>
          </div>
        </div>
      )}

      {episodes.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#2a2a2a]/50">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
              <List className="w-5 h-5 text-pink-400" />
              Daftar Episode ({episodes.length})
            </h2>
            {hasMore && (
              <button
                onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300 transition-colors"
              >
                {showAllEpisodes ? 'Tampilkan Sedikit' : `Tampilkan Semua (${episodes.length})`}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {displayEpisodes.map((ep, idx) => {
              const epNum = parseInt(cleanEpisode(ep.episode));
              const isValidNumber = !isNaN(epNum) && epNum > 0;

              return (
                <motion.button
                  key={`${ep.episode}-${idx}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleWatch(ep.url)}
                  className="group relative flex flex-col items-center justify-center p-4 rounded-xl glass hover:border-pink-400/50 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-400/10 border border-pink-400/20 flex items-center justify-center mb-2 group-hover:bg-pink-400/20 transition-colors">
                    <Play className="w-4 h-4 text-pink-400 ml-0.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-medium text-sm text-[#f5f0e8] text-center">
                    {isValidNumber ? `Episode ${epNum}` : ep.title || 'Episode'}
                  </span>
                  {ep.title && ep.title !== `Episode ${ep.episode}` && ep.title !== `Episode ${epNum}` && (
                    <p className="text-[10px] text-[#8a8278] text-center line-clamp-1 mt-1">
                      {ep.title}
                    </p>
                  )}
                  {ep.releaseDate && (
                    <p className="text-[10px] text-[#8a8278]/50 mt-1">
                      {ep.releaseDate}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
          {hasMore && !showAllEpisodes && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAllEpisodes(true)}
                className="px-6 py-2 rounded-lg bg-pink-400/10 text-pink-400 hover:bg-pink-400/20 transition-colors text-sm font-medium"
              >
                Tampilkan {episodes.length - 20} Episode Lainnya
              </button>
            </div>
          )}
        </div>
      )}

      {episodes.length === 0 && (
        <div className="text-center py-12 glass rounded-2xl border border-[#2a2a2a]/50 mt-4">
          <Tv className="w-16 h-16 text-[#8a8278] mx-auto mb-4 opacity-50" />
          <p className="text-[#8a8278] text-base font-medium">Belum ada episode tersedia</p>
        </div>
      )}

      {recommended.length > 0 && (
        <div className="pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2 mb-4">
            <Film className="w-5 h-5 text-pink-400" />
            Rekomendasi
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {recommended.slice(0, 10).map((rec, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.03 }}
                onClick={() => {
                  const slugPart = rec.url.split('/').filter(Boolean).pop() || '';
                  router.push(`/dashboard/anime/${slugPart}`);
                }}
                className="group cursor-pointer"
              >
                <div className="rounded-xl overflow-hidden border border-[#2a2a2a]/50 bg-[#141414] transition-all duration-300 hover:border-pink-400/50 hover:shadow-[0_0_20px_rgba(212,168,71,0.1)]">
                  <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                    {rec.poster ? (
                      <img src={rec.poster} alt={rec.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pink-400/5">
                        <Film className="w-8 h-8 text-[#8a8278]" />
                      </div>
                    )}
                    {rec.episode && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-pink-500/80 text-[10px] font-bold text-white">
                        {cleanEpisode(rec.episode)}
                      </div>
                    )}
                    {rec.rating && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#0a0a0a]/80 backdrop-blur-sm">
                        <span className="text-xs text-pink-400">{rec.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-medium text-[#f5f0e8] line-clamp-2">{rec.title}</h3>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}