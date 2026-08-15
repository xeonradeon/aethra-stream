'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Film,
  Star,
  ChevronLeft,
  Download,
  Play,
  Info,
  Tag,
  Share2,
  Clock,
} from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { GlassCard } from '@/components/GlassCard';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [isMovie, setIsMovie] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const cleanSlug = String(slug).replace(/^\/+/, '').replace(/\/+$/, '');
        const res = await fetch(`/api/scraper?source=movie&type=detail&slug=${encodeURIComponent(cleanSlug)}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Gagal mengambil data');
        }
        const result = await res.json();
        if (isMounted) {
          setData(result);
          const streams = result?.streams || [];
          const episodes = result?.episodes || [];
          setIsMovie(episodes.length === 0 && streams.length > 0);
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();

    return () => { isMounted = false; };
  }, [slug]);

  const handleWatch = (episodeUrl) => {
    if (!episodeUrl) return;
    const slugPart = episodeUrl?.split('/').filter(Boolean).pop() || '';
    if (slugPart) router.push(`/dashboard/movie/watch/${slugPart}`);
  };

  const handleWatchMovie = () => {
    router.push(`/dashboard/movie/watch/${slug}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.title,
          text: `Tonton ${data?.title} di AETHRA STREAM`,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link disalin!');
      }
    } catch (e) {}
  };

  if (loading) return <SkeletonLoader type="detail" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-[#8a8278]">Data tidak ditemukan</p>
    </div>
  );

  const metadata = data.metadata || {};
  const downloads = data.downloads || [];
  const episodes = data.episodes || [];
  const tags = data.tags || [];
  const streams = data.streams || [];

  const latestItem = episodes.length > 0 ? episodes[episodes.length - 1] : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Kembali</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="relative rounded-xl overflow-hidden border border-[#2a2a2a]/50 bg-[#141414] shadow-[0_0_20px_rgba(212,168,71,0.05)] aspect-[2/3] max-w-[240px] mx-auto md:mx-0">
            {data.poster ? (
              <img src={data.poster} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-red-400/5">
                <Film className="w-12 h-12 text-[#8a8278]" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex gap-1">
              <button onClick={handleShare} className="p-2 rounded-lg bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#2a2a2a]/50 text-[#8a8278] hover:border-[#d4a847]/50 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-5">
          <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#f5f0e8] leading-tight">
            {data.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            {data.rating && data.rating !== 'N/A' && data.rating !== '' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-400/10 border border-red-400/20 text-red-400 text-sm">
                <Star className="w-3.5 h-3.5 fill-red-400" />
                <span className="font-medium">{data.rating}</span>
                {data.rating_count && <span className="text-[10px] text-[#8a8278]">({data.rating_count} votes)</span>}
              </div>
            )}
            {metadata.Rating && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                {metadata.Rating}
              </span>
            )}
            {metadata.Kualitas && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                {metadata.Kualitas}
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2a2a2a]/50 text-[#8a8278] border border-[#2a2a2a]/30">
              {metadata.Durasi || 'Movie'}
            </span>
            {data.type && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                {data.type}
              </span>
            )}
          </div>

          {metadata.Genre && (
            <div className="flex flex-wrap gap-2">
              {metadata.Genre.split(',').map((genre) => (
                <span key={genre} className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-400/10 text-red-400 border border-red-400/20">
                  {genre.trim()}
                </span>
              ))}
            </div>
          )}

          {data.synopsis && data.synopsis !== 'Sinopsis tidak tersedia.' && (
            <div className="glass rounded-xl p-5 border border-[#2a2a2a]/50">
              <h3 className="font-heading text-sm font-bold text-[#f5f0e8] mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#d4a847]" />
                Sinopsis
              </h3>
              <p className="text-[#8a8278] text-sm leading-relaxed whitespace-pre-wrap">
                {data.synopsis}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {metadata.Tahun && (
              <div className="flex flex-col p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#8a8278] mb-1">Tahun</span>
                <span className="text-sm text-[#f5f0e8] font-medium">{metadata.Tahun}</span>
              </div>
            )}
            {metadata.Negara && (
              <div className="flex flex-col p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#8a8278] mb-1">Negara</span>
                <span className="text-sm text-[#f5f0e8] font-medium">{metadata.Negara}</span>
              </div>
            )}
            {metadata.Direksi && (
              <div className="flex flex-col p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#8a8278] mb-1">Direksi</span>
                <span className="text-sm text-[#f5f0e8] font-medium">{metadata.Direksi}</span>
              </div>
            )}
            {metadata.Pemain && (
              <div className="flex flex-col p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#8a8278] mb-1">Pemain</span>
                <span className="text-sm text-[#f5f0e8] font-medium">{metadata.Pemain}</span>
              </div>
            )}
            {metadata.Jaringan && (
              <div className="flex flex-col p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#8a8278] mb-1">Jaringan</span>
                <span className="text-sm text-[#f5f0e8] font-medium">{metadata.Jaringan}</span>
              </div>
            )}
          </div>

          {data.trailer && (
            <div className="glass rounded-xl overflow-hidden border border-[#2a2a2a]/50">
              <div className="aspect-video bg-[#0a0a0a]/90 flex items-center justify-center">
                <iframe
                  src={data.trailer}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media; fullscreen"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {isMovie && streams.length > 0 && (
        <div className="glass rounded-xl p-4 border border-red-400/30 shadow-[0_0_20px_rgba(212,168,71,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-[#f5f0e8]">
                <Film className="w-5 h-5 inline text-red-400 mr-2" />
                Streaming
              </h2>
              <p className="text-sm text-[#8a8278] mt-1">Tonton langsung tanpa perlu memilih episode</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#d4a847]">Available on {streams.length} server</span>
              </div>
            </div>
            <button
              onClick={handleWatchMovie}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-400/20 to-red-500/20 text-red-400 hover:from-red-400/30 hover:to-red-500/30 border border-red-400/30 transition-all duration-300 text-sm font-medium flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Tonton Sekarang
            </button>
          </div>
        </div>
      )}

      {latestItem && !isMovie && (
        <div className="glass rounded-xl p-4 border border-[#2a2a2a]/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-[#f5f0e8]">Rilis Terbaru</h2>
              <p className="text-sm text-[#8a8278] mt-1">{latestItem.title || 'Episode/Film Terbaru'}</p>
              {latestItem.releaseDate && (
                <p className="text-xs text-[#8a8278]/50 mt-0.5">Rilis: {latestItem.releaseDate}</p>
              )}
            </div>
            <button
              onClick={() => {
                const slugPart = latestItem.url.split('/').filter(Boolean).pop() || '';
                router.push(`/dashboard/movie/watch/${slugPart}`);
              }}
              className="px-4 py-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 border border-red-400/30 transition-colors text-sm font-medium"
            >
              Tonton Sekarang
            </button>
          </div>
        </div>
      )}

      {downloads.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
            <Download className="w-5 h-5 text-red-400" />
            Download
          </h2>
          <div className="flex flex-wrap gap-2">
            {downloads.map((dl, idx) => (
              <a
                key={idx}
                href={dl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 border border-red-400/20 transition-colors text-sm font-medium"
              >
                {dl.label || 'Download'}
              </a>
            ))}
          </div>
        </div>
      )}

      {episodes.length > 0 && !isMovie && (
        <div className="space-y-4 pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
            <Play className="w-5 h-5 text-red-400" />
            Episode ({episodes.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {episodes.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const slugPart = ep.url.split('/').filter(Boolean).pop() || '';
                  router.push(`/dashboard/movie/watch/${slugPart}`);
                }}
                className="px-4 py-2 rounded-lg glass hover:border-red-400/50 transition-colors text-sm font-medium"
              >
                {ep.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-sm font-bold text-[#f5f0e8] flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-[#d4a847]" />
            Tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded bg-[#2a2a2a]/50 text-[#8a8278] text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}