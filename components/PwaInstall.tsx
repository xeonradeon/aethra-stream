'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, ArrowRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua);
    setIsIOS(ios);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setShowInstall(false);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="glass-gold rounded-2xl p-4 border border-[#d4a847]/30 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4a847]/20 flex items-center justify-center">
                  <Download className="w-5 h-5 text-[#d4a847]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-[#f5f0e8] text-sm">
                    Install AETHRA STREAM
                  </h4>
                  <p className="text-xs text-[#8a8278]">
                    {isIOS 
                      ? 'Tap share lalu "Add to Home Screen"'
                      : 'Install app untuk akses cepat'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstall(false)}
                className="p-1 rounded-lg hover:bg-[#d4a847]/10 transition-colors"
              >
                <X className="w-4 h-4 text-[#8a8278]" />
              </button>
            </div>

            {!isIOS && (
              <motion.button
                onClick={handleInstall}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#d4a847] text-[#0a0a0a] font-bold text-sm hover:bg-[#e8c05a] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                <span>Install Aplikasi</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}

            {isIOS && (
              <div className="mt-3 p-2 rounded-lg bg-[#0a0a0a]/50 text-center">
                <p className="text-xs text-[#8a8278]">
                  📱 Buka Safari, tap ikon <span className="text-[#d4a847]">⬆️ Share</span>{' '}
                  lalu pilih <span className="text-[#d4a847]">"Add to Home Screen"</span>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
