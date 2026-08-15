'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Wifi,
  WifiOff,
  Clock,
  LogOut,
  HelpCircle,
  Shield,
  Crown,
  Menu,
} from 'lucide-react';
import { MoodDashboard } from './MoodDashboard';

export function DashboardTopBar() {
  const router = useRouter();
  const [time, setTime] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Jakarta',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#2a2a2a]/50 px-4 md:px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2 lg:hidden">
        <button 
          onClick={() => document.dispatchEvent(new CustomEvent('toggleSidebar'))}
          className="p-1.5 rounded-lg hover:bg-[#d4a847]/10 transition-colors"
        >
          <Menu className="w-5 h-5 text-[#d4a847]" />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <motion.div
          className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-lg bg-[#0a0a0a]/40 border border-[#2a2a2a]/30 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MoodDashboard />
          <div className="w-px h-4 bg-[#2a2a2a]/50" />
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#d4a847]" />
            <span className="font-mono text-xs text-[#f5f0e8]">{time}</span>
            <span className="text-[10px] text-[#8a8278]">WIB</span>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0a0a0a]/40 border border-[#2a2a2a]/30 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-[#d4a847]" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-[#8a8278]" />
          )}
          <span className={`text-[10px] font-medium ${isOnline ? 'text-[#d4a847]' : 'text-[#8a8278]'}`}>
            {isOnline ? 'Premium' : 'Offline'}
          </span>
        </motion.div>

        <motion.button
          className="p-1.5 rounded-lg hover:bg-[#d4a847]/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowSettings(!showSettings);
            setShowUserMenu(false);
          }}
        >
          <Settings className="w-5 h-5 text-[#8a8278]" />
        </motion.button>

        <motion.button
          className="w-7 h-7 rounded-full bg-gradient-to-r from-[#d4a847] to-[#b8942e] flex items-center justify-center ring-2 ring-[#d4a847]/30 shadow-[0_0_15px_rgba(212,168,71,0.2)]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowSettings(false);
          }}
        >
          <User className="w-3.5 h-3.5 text-[#0a0a0a]" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-4 top-14 w-56 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-xl border border-[#2a2a2a]/50 shadow-xl z-50"
          >
            <div className="p-3 border-b border-[#2a2a2a]/50">
              <span className="font-heading font-bold text-[#f5f0e8] text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Pengaturan
              </span>
            </div>
            <div className="p-1.5 space-y-0.5">
              <button onClick={() => { setShowSettings(false); router.push('/dashboard/settings'); }} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#d4a847]/5 transition-colors text-sm">
                <Shield className="w-4 h-4 text-[#8a8278]" />
                <span className="text-[#f5f0e8]">Privasi & Keamanan</span>
              </button>
              <button onClick={() => { setShowSettings(false); router.push('/dashboard/developer'); }} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#d4a847]/5 transition-colors text-sm">
                <Shield className="w-4 h-4 text-[#8a8278]" />
                <span className="text-[#f5f0e8]">Info Developer</span>
              </button>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#d4a847]/5 transition-colors text-sm">
                <HelpCircle className="w-4 h-4 text-[#8a8278]" />
                <span className="text-[#f5f0e8]">Bantuan</span>
              </button>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#d4a847]/10 transition-colors text-sm">
                <LogOut className="w-4 h-4 text-[#d4a847]" />
                <span className="text-[#d4a847]">Keluar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-4 top-14 w-56 bg-[#0a0a0a]/90 backdrop-blur-xl rounded-xl border border-[#2a2a2a]/50 shadow-xl z-50"
          >
            <div className="p-4 border-b border-[#2a2a2a]/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4a847] to-[#b8942e] flex items-center justify-center ring-2 ring-[#d4a847]/30 shadow-[0_0_15px_rgba(212,168,71,0.2)]">
                <User className="w-5 h-5 text-[#0a0a0a]" />
              </div>
              <div>
                <p className="text-[#f5f0e8] font-medium text-sm">Pengguna</p>
                <p className="text-xs text-[#8a8278] flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#d4a847]" />
                  Premium
                </p>
              </div>
            </div>
            <div className="p-1.5 space-y-0.5">
              <button onClick={() => { setShowUserMenu(false); router.push('/dashboard/settings'); }} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#d4a847]/5 transition-colors text-sm">
                <Settings className="w-4 h-4 text-[#8a8278]" />
                <span className="text-[#f5f0e8]">Pengaturan</span>
              </button>
              <button onClick={() => { setShowUserMenu(false); router.push('/dashboard/developer'); }} className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#d4a847]/5 transition-colors text-sm">
                <Shield className="w-4 h-4 text-[#8a8278]" />
                <span className="text-[#f5f0e8]">Info Developer</span>
              </button>
              <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[#d4a847]/10 transition-colors text-sm">
                <LogOut className="w-4 h-4 text-[#d4a847]" />
                <span className="text-[#d4a847]">Keluar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
