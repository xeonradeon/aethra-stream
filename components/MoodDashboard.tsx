'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Moon, Star } from 'lucide-react';

export function MoodDashboard() {
  const [mood, setMood] = useState('night');

  useEffect(() => {
    const updateMood = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setMood('morning');
      else if (hour >= 12 && hour < 18) setMood('afternoon');
      else if (hour >= 18 && hour < 21) setMood('evening');
      else setMood('night');
    };
    updateMood();
    const interval = setInterval(updateMood, 300000);
    return () => clearInterval(interval);
  }, []);

  const moodConfig = {
    morning: {
      icon: <Sun className="w-4 h-4 text-yellow-400" />,
      text: 'Selamat Pagi',
      gradient: 'from-[#d4a847]/10 via-[#f5d06b]/5 to-transparent',
    },
    afternoon: {
      icon: <Sun className="w-4 h-4 text-yellow-500" />,
      text: 'Selamat Siang',
      gradient: 'from-[#d4a847]/20 via-[#b8942e]/10 to-transparent',
    },
    evening: {
      icon: <Cloud className="w-4 h-4 text-orange-400" />,
      text: 'Selamat Sore',
      gradient: 'from-[#d4a847]/30 via-[#f5d06b]/15 to-transparent',
    },
    night: {
      icon: <Moon className="w-4 h-4 text-indigo-300" />,
      text: 'Selamat Malam',
      gradient: 'from-[#d4a847]/15 via-[#8a8278]/5 to-transparent',
    },
  };

  const current = moodConfig[mood];

  return (
    <div className="relative">
      <div className={`absolute inset-0 bg-gradient-to-b ${current.gradient} blur-xl -z-10`} />
      <motion.div
        key={mood}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-xs text-[#8a8278]"
      >
        {current.icon}
        <span>{current.text}</span>
      </motion.div>
    </div>
  );
}
