'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardTopBar } from '@/components/DashboardTopBar';
import { DeveloperFooter } from '@/components/DeveloperFooter';
import { UIConfig } from '@/components/UIConfig';
import { PwaInstall } from '@/components/PwaInstall';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GlassCard } from '@/components/GlassCard';
import { FloatingSearch } from '@/components/FloatingSearch';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  useKeyboardShortcuts();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] overflow-hidden select-none">
        <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#d4a847]/30 via-transparent to-transparent blur-[80px]" animate={{ scale: [1,1.2,1], opacity: [0.4,0.8,0.4] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }} />
        <motion.div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-[#d4a847]/30 via-transparent to-transparent blur-[80px]" animate={{ scale: [1,1.2,1], opacity: [0.4,0.8,0.4] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut', delay:0.3 }} />
        <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[800px] bg-gradient-to-r from-[#d4a847]/20 via-transparent to-transparent blur-[100px]" animate={{ scale: [1,1.1,1], opacity: [0.3,0.6,0.3] }} transition={{ duration:5, repeat:Infinity, ease:'easeInOut', delay:1 }} />
        <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[800px] bg-gradient-to-l from-[#d4a847]/20 via-transparent to-transparent blur-[100px]" animate={{ scale: [1,1.1,1], opacity: [0.3,0.6,0.3] }} transition={{ duration:5, repeat:Infinity, ease:'easeInOut', delay:1.5 }} />

        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ duration:1.5, ease:'easeOut' }} className="relative z-10 text-center flex flex-col items-center">
          <div className="relative overflow-hidden mb-4">
            <motion.img src="/as.jpg" alt="AETHRA" className="w-24 h-24 rounded-2xl border-2 border-[#d4a847]/50 shadow-[0_0_40px_rgba(212,168,71,0.3)]" initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2, duration:1 }} />
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4a847]/30 to-transparent" initial={{ x:'-100%' }} animate={{ x:'200%' }} transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }} />
          </div>
          <div className="relative overflow-hidden">
            <motion.h1 className="font-brand text-5xl md:text-7xl font-bold tracking-[0.15em] text-[#f5f0e8] gold-glow-text" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4, duration:1 }}>
              AETHRA
            </motion.h1>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4a847]/40 to-transparent" initial={{ x:'-100%' }} animate={{ x:'200%' }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut', delay:0.5 }} />
          </div>
          <motion.h2 className="font-brand text-lg md:text-2xl tracking-[0.6em] text-[#d4a847] mt-1" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8, duration:1 }}>
            STREAM
          </motion.h2>
          <motion.div className="flex items-center gap-2 mt-8" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2, duration:0.5 }}>
            <motion.div className="w-2 h-2 rounded-full bg-[#d4a847]/60" animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1.2, repeat:Infinity, delay:0 }} />
            <motion.div className="w-2 h-2 rounded-full bg-[#d4a847]/60" animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1.2, repeat:Infinity, delay:0.3 }} />
            <motion.div className="w-2 h-2 rounded-full bg-[#d4a847]/60" animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1.2, repeat:Infinity, delay:0.6 }} />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row w-full">
        <UIConfig />
        <NetworkStatus />
        <div className="fixed left-0 top-0 h-full z-40"><DashboardSidebar /></div>
        <div className="flex-1 flex flex-col min-h-screen w-full lg:ml-56 xl:ml-56 relative z-10">
          <DashboardTopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 lg:pt-4 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full max-w-7xl mx-auto px-2 md:px-4"
              >
                <GlassCard className="p-4 mb-6 hover:shadow-[0_0_40px_rgba(212,168,71,0.1)] transition-shadow duration-300">
                  {children}
                </GlassCard>
              </motion.div>
            </AnimatePresence>
            <DeveloperFooter />
          </main>
        </div>
        <PwaInstall />
        <FloatingSearch />
      </div>
    </ThemeProvider>
  );
}
