'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Sparkles, BookOpen, Star, Film, Tv } from 'lucide-react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) { setLoading(false); setResults([]); return; }
    const fetchSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const sources = ['anime', 'donghua', 'komik', 'movie'];
        const allResults = [];
        for (const source of sources) {
          try {
            const res = await fetch(`/api/scraper?source=${source}&type=search&query=${encodeURIComponent(query)}`);
            if (res.ok) {
              const data = await res.json();
              let items = data?.data?.items || data?.items || data?.data || [];
              if (!Array.isArray(items)) items = [];
              items.forEach((item) => {
                const url = item.link || item.url || '#';
                const slug = url.split('/').filter(Boolean).pop() || '';
                allResults.push({
                  title: item.title || item.name || 'Unknown',
                  url: url,
                  poster: item.thumbnail || item.poster || item.image || null,
                  type: item.type || item.format || item.status || 'Unknown',
                  source: source,
                  slug: slug,
                });
              });
            }
          } catch (e) {}
        }
        setResults(allResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query]);

  const handleResultClick = (result) => {
    const sources = { anime:'/dashboard/anime', donghua:'/dashboard/donghua', komik:'/dashboard/komik', movie:'/dashboard/movie' };
    const basePath = sources[result.source];
    if (basePath && result.slug) {
      router.push(`${basePath}/${result.slug}`);
    } else if (result.url && result.url !== '#') {
      window.open(result.url, '_blank');
    }
  };

  if (loading) return <SkeletonLoader type="card" count={8} />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!query) return <EmptyState icon="search" title="Cari Konten" description="Masukkan kata kunci untuk mencari anime, donghua, komik, atau movie" />;
  if (results.length === 0) return <EmptyState icon="search" title="Tidak Ditemukan" description={`Tidak ada hasil untuk "${query}"`} />;

  const sourceColors = { anime:'border-pink-400/30 bg-pink-400/10 text-pink-400', donghua:'border-amber-400/30 bg-amber-400/10 text-amber-400', komik:'border-emerald-400/30 bg-emerald-400/10 text-emerald-400', movie:'border-red-400/30 bg-red-400/10 text-red-400' };
  const sourceIcons = { anime:<Sparkles className="w-3 h-3" />, donghua:<Tv className="w-3 h-3" />, komik:<BookOpen className="w-3 h-3" />, movie:<Film className="w-3 h-3" /> };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><h1 className="font-heading text-2xl font-bold text-[#f5f0e8] flex items-center gap-2"><Search className="w-6 h-6 text-[#d4a847]" />Hasil Pencarian</h1><span className="text-sm text-[#8a8278]">({results.length} ditemukan)</span></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {results.map((item, index) => (
          <motion.div key={`${item.source}-${item.url}-${index}`} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: Math.min(index * 0.05, 0.5) }} className="group cursor-pointer" onClick={() => handleResultClick(item)}>
            <div className="bg-[#141414] rounded-xl border border-[#2a2a2a]/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-[#d4a847]/50">
              <div className="relative aspect-[2/3] bg-[#0a0a0a]/50 overflow-hidden">
                {item.poster ? <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} /> : <div className="w-full h-full flex items-center justify-center bg-[#d4a847]/5"><Search className="w-8 h-8 text-[#8a8278]" /></div>}
                <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded border ${sourceColors[item.source] || 'border-[#2a2a2a]/50 bg-[#0a0a0a]/80'}`}>{sourceIcons[item.source]}<span className="text-[10px] font-medium capitalize">{item.source}</span></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3"><button className="px-4 py-1.5 rounded-lg bg-[#d4a847] text-[#0a0a0a] text-xs font-bold hover:bg-[#e8c05a] transition-colors">Lihat Detail</button></div>
              </div>
              <div className="p-3"><h3 className="font-body text-sm font-medium text-[#f5f0e8] line-clamp-2">{item.title}</h3>{item.type && <p className="text-xs text-[#8a8278] mt-1">{item.type}</p>}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<SkeletonLoader type="card" count={8} />}><SearchContent /></Suspense>;
}
