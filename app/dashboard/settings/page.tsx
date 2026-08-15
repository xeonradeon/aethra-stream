'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Shield,
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  Save,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  RefreshCw,
  Settings,
  Crown,
  Palette,
  Eye,
  Info,
  Zap,
  Sparkles,
  BookOpen,
  Star,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [language, setLanguage] = useState('id');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const features = [
    { icon: <Sparkles className="w-4 h-4" />, name: 'Donghua', desc: 'Anime China dengan subtitle Indonesia' },
    { icon: <BookOpen className="w-4 h-4" />, name: 'Komik', desc: 'Manga, Manhwa, dan Manhua digital' },
    { icon: <Star className="w-4 h-4" />, name: 'Anime', desc: 'Anime subtitle Indonesia terlengkap' },
    { icon: <Zap className="w-4 h-4" />, name: 'Real-time', desc: 'Update konten setiap 30 detik' },
    { icon: <Eye className="w-4 h-4" />, name: 'Watch History', desc: 'Riwayat tontonan tersimpan' },
    { icon: <Shield className="w-4 h-4" />, name: 'Bookmark', desc: 'Simpan konten favorit' },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors"><ChevronLeft className="w-4 h-4" /><span className="text-sm">Kembali</span></button>
      <div className="flex items-center justify-between"><h1 className="font-heading text-2xl font-bold text-[#f5f0e8] flex items-center gap-3"><Settings className="w-6 h-6 text-[#d4a847]" />Pengaturan</h1><button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d4a847]/20 text-[#d4a847] border border-[#d4a847]/30 hover:bg-[#d4a847]/30 transition-colors disabled:opacity-50"><Save className="w-4 h-4" /><span className="text-sm font-medium">{saving ? 'Menyimpan...' : saveSuccess ? 'Tersimpan' : 'Simpan'}</span></button></div>

      <div className="glass-gold rounded-2xl p-6 border border-[#2a2a2a]/50"><h2 className="font-heading text-lg font-bold text-[#f5f0e8] mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-[#d4a847]" />Tampilan</h2><div className="space-y-3"><div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]/20"><div className="flex items-center gap-3">{theme === 'dark' ? <Moon className="w-4 h-4 text-[#8a8278]" /> : <Sun className="w-4 h-4 text-[#8a8278]" />}<span className="text-sm text-[#f5f0e8]">Mode Gelap</span></div><button onClick={toggleTheme} className={`w-10 h-5 rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-[#d4a847]' : 'bg-[#2a2a2a]'}`}><motion.div className={`w-4 h-4 rounded-full bg-[#0a0a0a] shadow-md transition-all duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} animate={{ x: theme === 'dark' ? 20 : 2 }} /></button></div></div></div>

      <div className="glass-gold rounded-2xl p-6 border border-[#2a2a2a]/50"><h2 className="font-heading text-lg font-bold text-[#f5f0e8] mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[#d4a847]" />Preferensi</h2><div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]/20"><div className="flex items-center gap-3"><Bell className="w-4 h-4 text-[#8a8278]" /><span className="text-sm text-[#f5f0e8]">Notifikasi</span></div><button onClick={() => setNotifications(!notifications)} className={`w-10 h-5 rounded-full transition-all duration-300 ${notifications ? 'bg-[#d4a847]' : 'bg-[#2a2a2a]'}`}><motion.div className={`w-4 h-4 rounded-full bg-[#0a0a0a] shadow-md transition-all duration-300 ${notifications ? 'translate-x-5' : 'translate-x-0.5'}`} animate={{ x: notifications ? 20 : 2 }} /></button></div>
        <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]/20"><div className="flex items-center gap-3">{sound ? <Volume2 className="w-4 h-4 text-[#8a8278]" /> : <VolumeX className="w-4 h-4 text-[#8a8278]" />}<span className="text-sm text-[#f5f0e8]">Suara</span></div><button onClick={() => setSound(!sound)} className={`w-10 h-5 rounded-full transition-all duration-300 ${sound ? 'bg-[#d4a847]' : 'bg-[#2a2a2a]'}`}><motion.div className={`w-4 h-4 rounded-full bg-[#0a0a0a] shadow-md transition-all duration-300 ${sound ? 'translate-x-5' : 'translate-x-0.5'}`} animate={{ x: sound ? 20 : 2 }} /></button></div>
        <div className="flex items-center justify-between py-2"><div className="flex items-center gap-3"><RefreshCw className="w-4 h-4 text-[#8a8278]" /><span className="text-sm text-[#f5f0e8]">Auto Play</span></div><button onClick={() => setAutoPlay(!autoPlay)} className={`w-10 h-5 rounded-full transition-all duration-300 ${autoPlay ? 'bg-[#d4a847]' : 'bg-[#2a2a2a]'}`}><motion.div className={`w-4 h-4 rounded-full bg-[#0a0a0a] shadow-md transition-all duration-300 ${autoPlay ? 'translate-x-5' : 'translate-x-0.5'}`} animate={{ x: autoPlay ? 20 : 2 }} /></button></div>
      </div></div>

      <div className="glass-gold rounded-2xl p-6 border border-[#2a2a2a]/50"><h2 className="font-heading text-lg font-bold text-[#f5f0e8] mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-[#d4a847]" />Kualitas & Bahasa</h2><div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]/20"><div className="flex items-center gap-3"><Monitor className="w-4 h-4 text-[#8a8278]" /><span className="text-sm text-[#f5f0e8]">Kualitas Video</span></div><select value={quality} onChange={(e) => setQuality(e.target.value)} className="px-3 py-1 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] outline-none"><option value="auto">Otomatis</option><option value="1080p">1080p</option><option value="720p">720p</option><option value="480p">480p</option><option value="360p">360p</option></select></div>
        <div className="flex items-center justify-between py-2"><div className="flex items-center gap-3"><Globe className="w-4 h-4 text-[#8a8278]" /><span className="text-sm text-[#f5f0e8]">Bahasa</span></div><select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-1 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] outline-none"><option value="id">Indonesia</option><option value="en">English</option><option value="ja">日本語</option><option value="zh">中文</option></select></div>
      </div></div>

      <div className="glass-gold rounded-2xl p-6 border border-[#2a2a2a]/50"><h2 className="font-heading text-lg font-bold text-[#f5f0e8] mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-[#d4a847]" />Fitur AETHRA STREAM</h2><div className="grid grid-cols-2 gap-3">{features.map((feature, idx) => <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30"><span className="text-[#d4a847]">{feature.icon}</span><div><p className="text-sm text-[#f5f0e8]">{feature.name}</p><p className="text-[10px] text-[#8a8278]">{feature.desc}</p></div></div>)}</div></div>

      <div className="glass-gold rounded-2xl p-6 border border-[#2a2a2a]/50"><h2 className="font-heading text-lg font-bold text-[#f5f0e8] mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-[#d4a847]" />Keamanan</h2><div className="space-y-3"><button className="flex items-center justify-between w-full py-2 border-b border-[#2a2a2a]/20 hover:bg-[#d4a847]/5 px-3 rounded-lg transition-colors"><div className="flex items-center gap-3"><Lock className="w-4 h-4 text-[#8a8278]" /><span className="text-sm text-[#f5f0e8]">Ubah Password</span></div><ChevronLeft className="w-4 h-4 text-[#8a8278] rotate-180" /></button><button className="flex items-center justify-between w-full py-2 hover:bg-[#d4a847]/5 px-3 rounded-lg transition-colors"><div className="flex items-center gap-3"><Shield className="w-4 h-4 text-[#8a8278]" /><span className="text-sm text-[#f5f0e8]">Privasi</span></div><ChevronLeft className="w-4 h-4 text-[#8a8278] rotate-180" /></button></div></div>

      <div className="glass-gold rounded-2xl p-4 border border-[#d4a847]/20 bg-[#d4a847]/5 text-center"><p className="text-xs text-[#8a8278]">AETHRA STREAM Premium<span className="text-[#d4a847] mx-2">•</span>v1.0.0</p><p className="text-[10px] text-[#8a8278]/50 mt-1 flex items-center justify-center gap-4"><span className="flex items-center gap-1"><Lock className="w-3 h-3" />Secure</span><span className="flex items-center gap-1"><Zap className="w-3 h-3" />Fast</span><span className="flex items-center gap-1"><Smartphone className="w-3 h-3" />PWA Ready</span></p></div>
    </div>
  );
}
