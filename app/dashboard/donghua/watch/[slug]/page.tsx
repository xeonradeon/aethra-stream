'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Play,
  Server,
  Download,
  Film,
  ArrowLeft,
  ArrowRight,
  List,
  Share2,
} from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { GlassCard } from '@/components/GlassCard';

export default function DonghuaWatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [totalEpisodes, setTotalEpisodes] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        let slugOnly = decodeURIComponent(slug);
        if (slugOnly.startsWith('http')) {
          const parts = slugOnly.split('/').filter(Boolean);
          slugOnly = parts.pop() || '';
        }
        if (slugOnly.includes('-episode-')) {
          const match = slugOnly.match(/^(.*?)(-episode-\d+)/);
          if (match) slugOnly = match[1] + match[2];
        }

        const res = await fetch(`/api/scraper?source=donghua&type=episode&slug=${encodeURIComponent(slugOnly)}`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Gagal mengambil data: ${res.status} - ${errorText}`);
        }
        const result = await res.json();
        if (isMounted) {
          if (!result || !result.data) throw new Error('Data tidak ditemukan');
          setData(result.data);

          const streams = result.data.streams || [];
          const validStream = streams.find((s) => s.url && s.url.startsWith('http'));
          if (validStream) setSelectedStream(validStream.url);

          const match = slug.match(/-episode-(\d+)/);
          if (match) {
            setCurrentEpisode(parseInt(match[1]));
          }

          const detailSlug = slugOnly.split('-episode-')[0] || slugOnly;
          const detailRes = await fetch(`/api/scraper?source=donghua&type=detail&slug=${detailSlug}`);
          let eps = [];
          if (detailRes.ok) {
            const detailResult = await detailRes.json();
            eps = detailResult?.data?.episodes || [];
          }

          const cleaned = eps.map(ep => ({
            ...ep,
            episode: String(ep.episode).trim() || '0',
          }));

          cleaned.sort((a, b) => parseInt(a.episode) - parseInt(b.episode));

          setAllEpisodes(cleaned);

          if (cleaned.length > 0) {
            const numbers = cleaned
              .map(ep => parseInt(ep.episode))
              .filter(n => !isNaN(n));
            if (numbers.length > 0) {
              setTotalEpisodes(Math.max(...numbers));
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handlePrev = () => {
    if (!data?.nav?.prev) return;
    const slugPrev = data.nav.prev.split('/').filter(Boolean).pop() || '';
    router.push(`/dashboard/donghua/watch/${slugPrev}`);
  };

  const handleNext = () => {
    if (!data?.nav?.next) return;
    const slugNext = data.nav.next.split('/').filter(Boolean).pop() || '';
    router.push(`/dashboard/donghua/watch/${slugNext}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.title,
          text: `Tonton ${data?.title} di AETHRA STREAM`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link disalin!');
      }
    } catch (e) {}
  };

  const isFirstEpisode = !data?.nav?.prev || (currentEpisode && currentEpisode <= 1);
  const isLastEpisode = !data?.nav?.next || (currentEpisode && totalEpisodes && currentEpisode >= totalEpisodes);

  if (loading) return <SkeletonLoader type="detail" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data) return null;

  const streams = data.streams || [];
  const downloads = data.downloads || [];
  const nav = data.nav || {};
  const poster = data.poster || null;
  const title = data.title || 'Menonton';

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
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {poster ? (
          <img
            src={poster}
            alt="Poster"
            className="w-24 h-36 object-cover rounded-lg shadow-lg ring-1 ring-yellow-500/20"
          />
        ) : (
          <Film className="w-16 h-16 text-[#8a8278] mx-auto opacity-50" />
        )}
        <div>
          <p className="text-[#8a8278] text-lg font-medium">Tidak ada stream tersedia</p>
          <p className="text-sm text-[#8a8278]/60 mt-1">
            Sumber video tidak ditemukan.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">Kembali ke Detail</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-[#f5f0e8]">
          {title}
        </h1>
        <button
          onClick={handleShare}
          className="p-2 rounded-lg border border-[#2a2a2a]/50 text-[#8a8278] hover:border-[#d4a847]/50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <GlassCard glow className="relative">
        <div className="aspect-video bg-[#0a0a0a]/90 flex items-center justify-center relative">
          {playerContent}
        </div>

        {streams.length > 0 && (
          <div className="p-4 border-t border-[#2a2a2a]/50">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-[#f5f0e8]">Pilih Server</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {streams.map((stream, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedStream(stream.url)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                    selectedStream === stream.url
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-[0_0_10px_rgba(212,168,71,0.1)]'
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
              <Download className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-[#f5f0e8]">Download</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {downloads.map((dl, idx) => (
                <div key={idx} className="flex flex-col gap-1 bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 rounded-lg p-2 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-[#d4a847] uppercase">{dl.resolution}</span>
                  <div className="flex flex-wrap gap-1">
                    {dl.links.map((link, lIdx) => (
                      <a key={lIdx} href={link.url} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-[#0a0a0a]/80 text-[10px] text-[#8a8278] hover:text-[#f5f0e8] hover:border-yellow-500/30 border border-transparent transition-all duration-300">
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={isFirstEpisode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            isFirstEpisode
              ? 'bg-[#2a2a2a]/30 text-[#5a554a] cursor-not-allowed border border-[#2a2a2a]/30'
              : 'glass border border-[#2a2a2a]/50 hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(212,168,71,0.05)]'
          }`}
        >
          <ArrowLeft className={`w-4 h-4 ${isFirstEpisode ? 'text-[#5a554a]' : 'text-yellow-500'}`} />
          <span className="text-sm">Sebelumnya</span>
        </button>

        <button
          onClick={handleNext}
          disabled={isLastEpisode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            isLastEpisode
              ? 'bg-[#2a2a2a]/30 text-[#5a554a] cursor-not-allowed border border-[#2a2a2a]/30'
              : 'glass border border-[#2a2a2a]/50 hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(212,168,71,0.05)]'
          }`}
        >
          <span className="text-sm">Selanjutnya</span>
          <ArrowRight className={`w-4 h-4 ${isLastEpisode ? 'text-[#5a554a]' : 'text-yellow-500'}`} />
        </button>
      </div>

      {allEpisodes.length > 0 && (
        <div className="pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-yellow-500" />
            Episode Lainnya ({allEpisodes.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {allEpisodes.map((ep, idx) => {
              const epNum = parseInt(ep.episode);
              const isCurrent = epNum === currentEpisode;
              const isValidNumber = !isNaN(epNum);

              return (
                <motion.button
                  key={idx}
                  onClick={() => {
                    const slugPart = ep.url.split('/').filter(Boolean).pop() || '';
                    router.push(`/dashboard/donghua/watch/${slugPart}`);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    isCurrent
                      ? 'border-2 border-yellow-500/60 bg-yellow-500/10 shadow-[0_0_15px_rgba(212,168,71,0.1)]'
                      : 'glass hover:border-yellow-500/50'
                  }`}
                >
                  <span className="text-sm font-medium text-[#f5f0e8]">
                    {isValidNumber ? `Ep ${epNum}` : ep.title || 'Episode'}
                  </span>
                  {ep.releaseDate && (
                    <span className="text-[10px] text-[#8a8278]/50 mt-1">
                      {ep.releaseDate}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] text-yellow-500 mt-1 font-semibold">
                      Sedang Diputar
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
