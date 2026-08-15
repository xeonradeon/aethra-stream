'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ScraperCardProps {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  stats?: string;
  onClick?: () => void;
}

export function ScraperCard({ name, icon, description, color, stats, onClick }: ScraperCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative w-full p-4 rounded-xl glass-gold border border-[#2a2a2a]/40 text-left transition-all duration-200 hover:border-[#d4a847]/40"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>{icon}</div>
        <h3 className="font-heading text-sm font-bold text-[#f5f0e8] mb-1">{name}</h3>
        <p className="text-xs text-[#8a8278] line-clamp-2">{description}</p>
        {stats && <div className="mt-2 flex items-center gap-1 text-xs text-[#d4a847]/70"><span>{stats}</span><span className="text-[#8a8278]">•</span><span className="text-[#8a8278]">Premium</span></div>}
        <div className="mt-3 flex items-center gap-1 text-xs text-[#d4a847]"><span>Jelajahi</span><ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></div>
      </div>
    </motion.button>
  );
}
