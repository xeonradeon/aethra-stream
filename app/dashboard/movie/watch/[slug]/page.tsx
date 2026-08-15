'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Play,
  Server,
  Download,
  Film,
  Share2,
  List,
} from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { GlassCard } from '@/components/GlassCard';

export default function MovieWatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [totalEpisodes, setTotalEpisodes] = useState(0);
  const [episodes, setEpisodes] = useState([]);
  const [isMovie, setIsMovie] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const cleanSlug = String(slug).replace(/^\/+/, '').replace(/\/+$/, '');
        
        const detailRes = await fetch(`/api/scraper?source=movie&type=detail&slug=${encodeURIComponent(cleanSlug)}`);
        if (!detailRes.ok) throw new Error('Gagal mengambil data');
        const detailResult = await detailRes.json();
        
        let episodeRes;
        let episodeResult;
        try {
          episodeRes = await fetch(`/api/scraper?source=movie&type=episode&slug=${encodeURIComponent(cleanSlug)}`);
          if (episodeRes.ok) {
            episodeResult = await episodeRes.json();
          }
        } catch (e) {
        }

        if (isMounted) {
          setDetailData(detailResult);
          
          const streams = detailResult?.streams || episodeResult?.streams || [];
          if (streams.length > 0) setSelectedStream(streams[0].url);
          
          const eps = detailResult?.episodes || episodeResult?.episodes || [];
          setEpisodes(eps);
          setTotalEpisodes(eps.length);

          const movieDetected = eps.length === 0 && streams.length > 0;
          setIsMovie(movieDetected);

          let epNum = null;
          const match = cleanSlug.match(/-episode-(\d+)/);
          if (match) epNum = parseInt(match[1]);
          else if (cleanSlug.match(/-season-(\d+)-episode-(\d+)/)) {
            epNum = parseInt(cleanSlug.match(/-season-(\d+)-episode-(\d+)/)[2]);
          }
          setCurrentEpisode(epNum || (movieDetected ? 1 : null));

          setData({
            ...detailResult,
            ...episodeResult,
            streams: streams,
            episodes: eps,
          });
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

  const handleBack = () => {
    const baseSlug = String(slug).replace(/-episode-\d+$/, '').replace(/-season-\d+-episode-\d+$/, '');
    router.push(`/dashboard/movie/${baseSlug}`);
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
  if (!data) return null;

  const streams = data.streams || [];
  const downloads = data.downloads || [];
  const title = data.title || 'Menonton';
  const poster = data.poster || null;

  const playerContent = selectedStream ? (
    <iframe
      src={selectedStream}
      className="w-full h-full"
      allowFullScreen
      allow="autoplay; encrypted-media; fullscreen"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      loading="lazy"
    />
  ) : (
    <div className="text-center p-8 flex flex-col items-center gap-2 relative">
      {poster && (
        <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm" style={{ backgroundImage: `url(${poster})` }} />
      )}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {poster ? (
          <img src={poster} alt="Poster" className="w-24 h-36 object-cover rounded-lg shadow-lg ring-1 ring-red-500/20" />
        ) : (
          <Film className="w-16 h-16 text-[#8a8278] mx-auto opacity-50" />
        )}
        <div>
          <p className="text-[#8a8278] text-lg font-medium">Tidak ada stream tersedia</p>
          <p className="text-sm text-[#8a8278]/60 mt-1">Sumber video tidak ditemukan.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={handleBack} className="flex items-center gap-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Kembali ke Detail</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-[#f5f0e8]">{title}</h1>
        <button onClick={handleShare} className="p-2 rounded-lg border border-[#2a2a2a]/50 text-[#8a8278] hover:border-[#d4a847]/50 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {isMovie && (
        <div className="glass rounded-xl p-3 border border-red-400/30 shadow-[0_0_10px_rgba(212,168,71,0.05)]">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-[#f5f0e8]">Movie</span>
            <span className="text-xs text-[#8a8278]">• Single Episode</span>
            <span className="text-[10px] text-[#d4a847] ml-auto">{streams.length} Server</span>
          </div>
        </div>
      )}

      <GlassCard glow className="relative">
        <div className="aspect-video bg-[#0a0a0a]/90 flex items-center justify-center relative">
          {playerContent}
        </div>

        {streams.length > 0 && (
          <div className="p-4 border-t border-[#2a2a2a]/50">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-[#f5f0e8]">Pilih Server</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {streams.map((stream, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedStream(stream.url)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    selectedStream === stream.url
                      ? 'bg-red-400/20 text-red-400 border border-red-400/30 shadow-[0_0_10px_rgba(212,168,71,0.1)]'
                      : 'bg-[#0a0a0a]/50 text-[#8a8278] hover:text-[#f5f0e8] border border-[#2a2a2a]/30'
                  }`}
                >
                  {stream.server || 'Server'}
                </button>
              ))}
            </div>
          </div>
        )}

        {downloads.length > 0 && (
          <div className="p-4 border-t border-[#2a2a2a]/50">
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-[#f5f0e8]">Download</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {downloads.map((dl, idx) => (
                <div key={idx} className="flex flex-col gap-1 bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 rounded-lg p-2 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-[#d4a847] uppercase">{dl.label || 'Download'}</span>
                  <div className="flex flex-wrap gap-1">
                    <a href={dl.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-[#0a0a0a]/80 text-[10px] text-[#8a8278] hover:text-[#f5f0e8] hover:border-red-400/30 border border-transparent transition-all duration-300">
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {episodes.length > 1 && !isMovie && (
        <div className="pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-red-400" />
            Episode Lainnya ({episodes.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {episodes.map((ep, idx) => {
              const epNum = parseInt(ep.title?.match(/\d+/)?.[0] || '0');
              const isCurrent = !isNaN(epNum) && epNum === currentEpisode;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    const slugPart = ep.url.split('/').filter(Boolean).pop() || '';
                    router.push(`/dashboard/movie/watch/${slugPart}`);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    isCurrent
                      ? 'border-2 border-red-400/60 bg-red-400/10 shadow-[0_0_15px_rgba(212,168,71,0.1)]'
                      : 'glass hover:border-red-400/50'
                  }`}
                >
                  <span className="text-sm font-medium text-[#f5f0e8]">{ep.title}</span>
                  {isCurrent && (
                    <span className="text-[10px] text-red-400 mt-1 font-semibold">
                      Sedang Diputar
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}