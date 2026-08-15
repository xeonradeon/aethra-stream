'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Sparkles,
  BookOpen,
  Menu,
  X,
  Crown,
  Code,
  Settings,
  Tv,
  Film,
  Info,
  Search,
} from 'lucide-react';
import { Logo } from './Logo';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  color?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Beranda', icon: <Home className="w-5 h-5" />, path: '/dashboard' },
  { label: 'Anime', icon: <Sparkles className="w-5 h-5" />, path: '/dashboard/anime', color: 'text-pink-400' },
  { label: 'Donghua', icon: <Tv className="w-5 h-5" />, path: '/dashboard/donghua', color: 'text-amber-400' },
  { label: 'Komik', icon: <BookOpen className="w-5 h-5" />, path: '/dashboard/komik', color: 'text-emerald-400' },
  { label: 'Movie', icon: <Film className="w-5 h-5" />, path: '/dashboard/movie', color: 'text-red-400' },
];

const bottomItems: NavItem[] = [
  { label: 'Info Platform', icon: <Info className="w-5 h-5" />, path: '/dashboard/info' },
  { label: 'Info Dev', icon: <Code className="w-5 h-5" />, path: '/dashboard/developer' },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/dashboard/settings' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(!isMobileOpen);
    document.addEventListener('toggleSidebar', handleToggle);
    return () => document.removeEventListener('toggleSidebar', handleToggle);
  }, [isMobileOpen]);

  return (
    <>
      <motion.aside
        className={`fixed left-0 top-0 h-full z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-[#2a2a2a]/60 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        initial={false}
        animate={{ width: isCollapsed ? 64 : 256 }}
      >
        <div className={`flex items-center h-14 px-4 border-b border-[#2a2a2a]/50 ${isCollapsed ? 'justify-center' : ''}`}>
          {isCollapsed ? (
            <Logo variant="icon" className="scale-75" />
          ) : (
            <Logo variant="full" />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 rounded-lg hover:bg-[#d4a847]/10 transition-colors ml-auto"
          >
            <Menu className="w-4 h-4 text-[#8a8278]" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                prefetch={true}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#d4a847]/10 border border-[#d4a847]/40 text-[#f5f0e8] shadow-[0_0_15px_rgba(212,168,71,0.1)]'
                    : 'hover:bg-[#d4a847]/5 text-[#8a8278] hover:text-[#f5f0e8]'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span className={isActive ? 'text-[#d4a847]' : 'text-[#8a8278]'}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-5 rounded-full bg-[#d4a847] shadow-[0_0_10px_rgba(212,168,71,0.5)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="p-4 border-t border-[#2a2a2a]/50">
            {bottomItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  prefetch={true}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#d4a847]/10 border border-[#d4a847]/40 text-[#f5f0e8]'
                      : 'hover:bg-[#d4a847]/5 text-[#8a8278] hover:text-[#f5f0e8]'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <span className={isActive ? 'text-[#d4a847]' : 'text-[#8a8278]'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
          <div className={`p-4 border-t border-[#2a2a2a]/50 ${isCollapsed ? 'text-center' : ''}`}>
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-[#d4a847]/10 border border-[#d4a847]/20 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-2 h-2 rounded-full bg-[#d4a847] animate-pulse shadow-[0_0_10px_rgba(212,168,71,0.5)]" />
              {!isCollapsed && <span className="text-xs text-[#d4a847]">Premium</span>}
              {!isCollapsed && (
                <Crown className="w-3 h-3 text-[#d4a847] ml-auto" />
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm z-30"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
