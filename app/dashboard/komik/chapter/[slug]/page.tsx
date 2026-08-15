'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, BookOpen } from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';

export default function KomikChapterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);
  const [allChapters, setAllChapters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/scraper?source=komik&type=chapter&slug=${slug}`);
        if (!res.ok) throw new Error('Gagal mengambil data');
        const result = await res.json();
        setData(result);

        const baseSlug = slug.replace(/\/chapter-\d+$/, '');
        const detailRes = await fetch(`/api/scraper?source=komik&type=detail&slug=${baseSlug}`);
        if (detailRes.ok) {
          const detailResult = await detailRes.json();
          const chapters = detailResult?.data?.chapters || [];
          setAllChapters(chapters);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  const handleBack = () => {
    const baseSlug = slug.replace(/\/chapter-\d+$/, '');
    router.push(`/dashboard/komik/${baseSlug}`);
  };

  const handleNavigate = (url: string | null) => {
    if (!url) return;
    const slugPart = url.split('/').filter(Boolean).pop() || '';
    if (slugPart) {
      router.push(`/dashboard/komik/chapter/${slugPart}`);
    }
  };

  const handleChapterClick = (url: string) => {
    const slugPart = url.split('/').filter(Boolean).pop() || '';
    if (slugPart) {
      router.push(`/dashboard/komik/chapter/${slugPart}`);
    }
  };

  const handleNext = () => {
    if (!navigation.next) return;
    const slugPart = navigation.next.split('/').filter(Boolean).pop() || '';
    if (slugPart) {
      router.push(`/dashboard/komik/chapter/${slugPart}`);
    }
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
  const images = komik.images || [];
  const displayImages = showAll ? images : images.slice(0, 20);
  const navigation = komik.navigation || {};
  const title = komik.title || 'Chapter';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Kembali ke Detail</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl md:text-2xl font-bold text-[#f5f0e8]">{title}</h1>
        <span className="text-sm text-[#8a8278]">{images.length} Halaman</span>
      </div>

      <div className="space-y-4">
        {displayImages.map((img: string, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl overflow-hidden border border-[#2a2a2a]/50 bg-[#141414] relative"
          >
            <img
              src={img}
              alt={`Halaman ${index + 1}`}
              className="w-full object-contain"
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#0a0a0a]/80 text-[10px] text-[#8a8278]">
              {index + 1} / {images.length}
            </div>
          </motion.div>
        ))}
      </div>

      {images.length > 20 && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-colors text-sm"
          >
            {showAll
              ? 'Tampilkan Sedikit'
              : `Tampilkan Semua (${images.length} Halaman)`}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => handleNavigate(navigation.prev)}
          disabled={!navigation.prev}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-[#2a2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-400/50 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4 text-emerald-400" />
          <span className="text-sm">Chapter Sebelumnya</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!navigation.next}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-[#2a2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-emerald-400/50 transition-all duration-300"
        >
          <span className="text-sm">Chapter Selanjutnya</span>
          <ChevronRight className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {allChapters.length > 0 && (
        <div className="pt-6 border-t border-[#2a2a2a]/50">
          <h2 className="font-heading text-xl font-bold text-[#f5f0e8] flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-emerald-400" />
            Chapter Lainnya ({allChapters.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {allChapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() => handleChapterClick(ch.url)}
                className="flex flex-col items-center justify-center p-3 rounded-xl glass hover:border-emerald-400/50 transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="text-sm font-medium text-[#f5f0e8]">
                  Chapter {ch.chapter}
                </span>
                {ch.date && (
                  <span className="text-[10px] text-[#8a8278]/50">{ch.date}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
