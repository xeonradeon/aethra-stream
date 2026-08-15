'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, Search, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#d4a847]/10 border border-[#d4a847]/30 flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-[#d4a847]" />
        </div>
        <h1 className="font-heading text-6xl font-bold text-[#f5f0e8] mb-2">404</h1>
        <h2 className="font-heading text-xl font-bold text-[#f5f0e8] mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-[#8a8278] mb-6">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#d4a847] text-[#0a0a0a] font-bold hover:bg-[#e8c05a] transition-colors">
            <Home className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <Link href="/dashboard/search" className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg glass border border-[#2a2a2a]/50 hover:border-[#d4a847]/30 transition-colors">
            <Search className="w-4 h-4" /> Cari Konten
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
