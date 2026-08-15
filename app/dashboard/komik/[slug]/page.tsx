'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Star, ChevronLeft, List, Play, Info, Share2, Clock } from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { GlassCard } from '@/components/GlassCard';

export default function KomikDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/scraper?source=komik&type=detail&slug=${slug}`);
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

  const handleRead = (chapterUrl: string) => {
    const slugPart = chapterUrl?.split('/').filter(Boolean).pop() || '';
    if (slugPart) {
      router.push(`/dashboard/komik/chapter/${slugPart}`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: data?.data?.title,
          text: `Baca ${data?.data?.title} di AETHRA STREAM`,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link disalin!');
      }
    } catch (e) {}
  };

  const getLatestChapter = (chapters) => {
    if (!chapters || chapters.length === 0) return null;
    let latest = chapters[0];
    for (const ch of chapters) {
      const num1 = parseFloat(String(ch.chapter).replace(/[^0-9.]/g, ''));
      const num2 = parseFloat(String(latest.chapter).replace(/[^0-9.]/g, ''));
      if (!isNaN(num1) && !isNaN(num2) && num1 > num2) {
        latest = ch;
      }
    }
    return latest;
  };

  if (loading) return <SkeletonLoader type="detail" />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data?.data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#8a8278]">Data tidak ditemukan</p>
      </div>
    );
  }

  const komik = data.data;
  const rating = komik.rating ? parseFloat(komik.rating) : 0;
  const chapters = Array.isArray(komik.chapters) ? komik.chapters : [];
  const info = komik.info || {};
  const genres = komik.genres || [];
  const synopsis = komik.synopsis || 'Sinopsis tidak tersedia.';
  const poster = komik.poster || null;
  const title = komik.title || 'Judul Tidak Diketahui';
  const related = komik.related || [];

  const latestChapter = getLatestChapter(chapters);

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
              <div className="w-full h-full flex items-center justify-center bg-emerald-400/5">
                <BookOpen className="w-12 h-12 text-[#8a8278]" />
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
          <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-[#f5f0e8] leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            {rating > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm">
                <Star className="w-3.5 h-3.5 fill-emerald-400" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
            {info.Status && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                {info.Status}
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#2a2a2a]/50 text-[#8a8278] border border-[#2a2a2a]/30">
              {chapters.length} Chapter
            </span>
            {info.Type && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                {info.Type}
              </span>
            )}
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
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
                  <span className="text-sm text-[#f5f0e8] font-medium">{value as string}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {latestChapter && (
        <div className="glass rounded-xl p-4 border border-[#2a2a2a]/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-[#f5f0e8]">Chapter Terbaru</h2>
              <p className="text-sm text-[#8a8278] mt-1">
                {latestChapter.title || `Chapter ${latestChapter.chapter}`}
              </p>
              {latestChapter.date && (
                <p className="text-xs text-[#8a8278]/50 mt-0.5">
                  Rilis: {latestChapter.date}
                </p>
              )}
            </div>
            <button
              onClick={() => handleRead(latestChapter.url)}
              className="px-4 py-2 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 border border-emerald-400/30 transition-colors text-sm font-medium"
            >
              Baca Sekarang
            </button>
          </div>
        </div>
      )}

      {chapters.length > 0 ? (
        <div className="space-y-4 pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2">
            <List className="w-5 h-5 text-emerald-400" />
            Daftar Chapter ({chapters.length})
          </h2>
          <div className="overflow-y-auto max-h-[400px] pr-2 space-y-2">
            {chapters.map((ch: any, idx: number) => (
              <motion.button
                key={ch.chapter || idx}
                onClick={() => handleRead(ch.url)}
                className="w-full flex items-center justify-between p-3 rounded-xl glass hover:border-emerald-400/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-sm text-[#f5f0e8]">
                    Chapter {ch.chapter}
                  </span>
                </div>
                {ch.date && (
                  <span className="text-xs text-[#8a8278]/50">{ch.date}</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 glass rounded-2xl border border-[#2a2a2a]/50 mt-4">
          <BookOpen className="w-16 h-16 text-[#8a8278] mx-auto mb-4 opacity-50" />
          <p className="text-[#8a8278] text-base font-medium">Belum ada chapter tersedia</p>
        </div>
      )}

      {related.length > 0 && (
        <div className="pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Komik Terkait
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {related.slice(0, 10).map((rec, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  const slugPart = rec.url.split('/').filter(Boolean).pop() || '';
                  router.push(`/dashboard/komik/${slugPart}`);
                }}
                className="group cursor-pointer"
              >
                <div className="rounded-xl overflow-hidden border border-[#2a2a2a]/50 bg-[#141414] transition-all duration-300 hover:border-emerald-400/50 hover:scale-[1.02]">
                  <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                    {rec.poster ? (
                      <img src={rec.poster} alt={rec.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-400/5">
                        <BookOpen className="w-8 h-8 text-[#8a8278]" />
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
