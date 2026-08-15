'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-12 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 rounded-full bg-[#d4a847]/10 border border-[#d4a847]/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,168,71,0.1)]">
        <AlertCircle className="w-10 h-10 text-[#d4a847]" />
      </div>
      <h3 className="font-heading text-xl font-bold text-[#f5f0e8] mb-2">
        Terjadi Kesalahan
      </h3>
      <p className="text-[#8a8278] max-w-md mb-6">
        {message}
      </p>
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#d4a847]/20 border border-[#d4a847]/30 text-[#d4a847] font-medium text-sm hover:bg-[#d4a847]/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Coba Lagi</span>
        </motion.button>
      )}
    </motion.div>
  );
}
