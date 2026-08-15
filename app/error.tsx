'use client';

import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#f5f0e8] mb-4">Terjadi Kesalahan</h1>
        <p className="text-[#8a8278] mb-6">{error.message || 'Terjadi kesalahan yang tidak terduga.'}</p>
        <button onClick={reset} className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#d4a847] text-[#0a0a0a] font-bold hover:bg-[#e8c05a] transition-colors mx-auto">
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </button>
      </motion.div>
    </div>
  );
}
