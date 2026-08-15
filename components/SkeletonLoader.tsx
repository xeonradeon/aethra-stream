'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'detail';
  count?: number;
}

export function SkeletonLoader({ type = 'card', count = 4 }: SkeletonLoaderProps) {
  const shimmerBase = 'bg-gradient-to-r from-[#d4a847]/10 via-[#d4a847]/20 to-[#d4a847]/10 bg-[length:200%_100%] animate-shimmer-smooth';

  const renderCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className={`aspect-[2/3] ${shimmerBase}`} />
      <div className="p-3 space-y-2">
        <div className={`h-4 w-full rounded ${shimmerBase}`} />
        <div className={`h-3 w-2/3 rounded ${shimmerBase}`} />
      </div>
    </motion.div>
  );

  const renderList = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-3 bg-card rounded-xl border border-border/50"
    >
      <div className={`w-16 h-24 rounded-lg ${shimmerBase} flex-shrink-0`} />
      <div className="flex-1 space-y-2">
        <div className={`h-4 w-3/4 rounded ${shimmerBase}`} />
        <div className={`h-3 w-1/2 rounded ${shimmerBase}`} />
        <div className={`h-3 w-2/3 rounded ${shimmerBase}`} />
      </div>
    </motion.div>
  );

  const renderDetail = () => (
    <div className="space-y-4">
      <div className="flex gap-6">
        <div className={`w-48 h-64 rounded-xl flex-shrink-0 ${shimmerBase}`} />
        <div className="flex-1 space-y-3">
          <div className={`h-8 w-3/4 rounded ${shimmerBase}`} />
          <div className={`h-4 w-1/2 rounded ${shimmerBase}`} />
          <div className={`h-20 rounded ${shimmerBase}`} />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className={`h-6 w-16 rounded-full ${shimmerBase}`} />)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <div key={i} className={`h-10 rounded-lg ${shimmerBase}`} />)}
      </div>
    </div>
  );

  const getContent = () => {
    switch (type) {
      case 'list': return Array.from({ length: count }, (_, i) => renderList());
      case 'detail': return renderDetail();
      default: return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: count }, (_, i) => renderCard())}
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className={`h-6 w-32 rounded ${shimmerBase}`} />
        <div className={`h-4 w-20 rounded ${shimmerBase}`} />
      </div>
      {getContent()}
    </div>
  );
}
