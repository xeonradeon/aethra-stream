'use client';

import { motion } from 'framer-motion';
import { Search, Film, BookOpen, Sparkles, Tv, Star } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'film' | 'book' | 'sparkles' | 'tv' | 'star';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  const IconMap = {
    search: Search,
    film: Film,
    book: BookOpen,
    sparkles: Sparkles,
    tv: Tv,
    star: Star,
  };

  const Icon = IconMap[icon];

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-12 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 rounded-full bg-[#d4a847]/10 border border-[#d4a847]/30 flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(212,168,71,0.1)]">
        <Icon className="w-10 h-10 text-[#d4a847]" />
      </div>
      <h3 className="font-heading text-xl font-bold text-[#f5f0e8] mb-2">
        {title}
      </h3>
      <p className="text-[#8a8278] max-w-md mb-6">
        {description}
      </p>
      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#d4a847] to-[#b8942e] text-[#0a0a0a] font-bold text-sm hover:from-[#e8c05a] hover:to-[#c9a03a] transition-all duration-300 shadow-[0_0_30px_rgba(212,168,71,0.2)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
