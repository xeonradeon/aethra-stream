'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#2a2a2a] border-t-[#d4a847] rounded-full animate-spin" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#d4a847]/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <motion.p
          className="text-sm text-[#8a8278]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Memuat konten premium...
        </motion.p>
      </motion.div>
    </div>
  );
}
