'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className = '', hover = true, glow = false }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.005 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative rounded-xl
        bg-[#141414]/60 border border-[#2a2a2a]/40
        ${glow ? 'hover:shadow-[0_0_40px_rgba(212,168,71,0.1)] transition-shadow duration-300' : ''}
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
