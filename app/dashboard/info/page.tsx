'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Crown, Zap, Globe, Shield, Search, BookOpen, Tv, Film, Sparkles, Info, Heart, Star, Clock, Layers, Code, Settings, HelpCircle, Mail, Users, Database, Home } from 'lucide-react';

export default function InfoPage() {
  const router = useRouter();

  const features = [
    { icon: <Sparkles className="w-5 h-5" />, label: 'Anime', desc: 'Anime subtitle Indonesia terlengkap' },
    { icon: <Tv className="w-5 h-5" />, label: 'Donghua', desc: 'Anime China terbaru dengan subtitle Indonesia' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Komik', desc: 'Komik, manga, dan manhwa digital' },
    { icon: <Film className="w-5 h-5" />, label: 'Movie', desc: 'Film & drama subtitle Indonesia' },
  ];

  const rules = [
    'Jelajahi 4 sumber konten: Anime, Donghua, Komik, dan Movie.',
    'Gunakan fitur pencarian untuk menemukan judul favorit Anda.',
    'Data diperbarui secara real-time setiap 30 detik.',
    'Akses Premium untuk pengalaman tanpa iklan dan konten eksklusif.',
    'Klik kartu sumber untuk langsung menuju halaman konten.',
    'Setiap konten memiliki halaman detail lengkap dengan sinopsis dan episode.',
    'Gunakan tombol kembali untuk navigasi yang mudah.',
    'Dukung pengembang dengan memberikan masukan atau berlangganan Premium.',
  ];

  const faqs = [
    { q: 'Apa itu AETHRA STREAM?', a: 'AETHRA STREAM adalah platform streaming premium yang menghadirkan koleksi Anime, Donghua, Komik, dan Movie dengan subtitle Indonesia.' },
    { q: 'Apakah AETHRA STREAM gratis?', a: 'Ya, Anda dapat menikmati konten secara gratis. Namun, dengan berlangganan Premium, Anda mendapatkan pengalaman tanpa iklan dan akses konten eksklusif.' },
    { q: 'Bagaimana cara mencari konten?', a: 'Gunakan bilah pencarian di dashboard atau halaman sumber. Anda dapat mencari berdasarkan judul, genre, atau negara.' },
    { q: 'Apakah konten diperbarui secara berkala?', a: 'Ya, konten diperbarui secara real-time setiap 30 detik dari sumber terpercaya.' },
    { q: 'Bagaimana cara melaporkan masalah?', a: 'Anda dapat menghubungi pengembang melalui halaman Info Developer atau mengirim email ke support@aethrastream.com.' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors"><ChevronLeft className="w-4 h-4" /><span className="text-sm">Kembali</span></button>
      <div className="glass-gold rounded-2xl p-8 border border-[#d4a847]/20 shadow-[0_0_40px_rgba(212,168,71,0.08)]">
        <div className="flex items-center gap-3 mb-8"><div className="w-16 h-16 rounded-full bg-[#d4a847]/20 border border-[#d4a847]/30 flex items-center justify-center"><Info className="w-8 h-8 text-[#d4a847]" /></div><div><h1 className="font-heading text-3xl md:text-4xl font-bold text-[#f5f0e8]">Tentang AETHRA STREAM</h1><p className="text-sm text-[#8a8278]">Platform streaming premium terbaik untuk konten Asia</p></div></div>
        <div className="space-y-8">
          <div><h2 className="font-heading text-xl font-bold text-[#f5f0e8] mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-[#d4a847]" />Apa itu AETHRA STREAM?</h2><p className="text-[#8a8278] text-sm leading-relaxed">AETHRA STREAM adalah platform streaming premium yang menghadirkan koleksi lengkap <span className="text-[#f5f0e8]">Anime, Donghua, Komik, dan Movie</span> dengan subtitle Indonesia. Kami menghadirkan pengalaman menonton dan membaca yang terbaik dengan antarmuka yang elegan, cepat, dan responsif.</p></div>
          <div><h2 className="font-heading text-xl font-bold text-[#f5f0e8] mb-4 flex items-center gap-2"><Layers className="w-5 h-5 text-[#d4a847]" />4 Sumber Konten</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{features.map((feat, idx) => <div key={idx} className="glass rounded-xl p-5 text-center border border-[#2a2a2a]/50 hover:border-[#d4a847]/30 transition-colors"><div className="flex justify-center mb-2">{feat.icon}</div><h3 className="font-heading text-sm font-bold text-[#f5f0e8]">{feat.label}</h3><p className="text-[10px] text-[#8a8278]">{feat.desc}</p></div>)}</div></div>
          <div><h2 className="font-heading text-xl font-bold text-[#f5f0e8] mb-3 flex items-center gap-2"><Shield className="w-5 h-5 text-[#d4a847]" />Panduan & Rules</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{rules.map((rule, idx) => <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30"><Zap className="w-4 h-4 text-[#d4a847] mt-0.5 flex-shrink-0" /><p className="text-sm text-[#f5f0e8]">{rule}</p></div>)}</div></div>
          <div><h2 className="font-heading text-xl font-bold text-[#f5f0e8] mb-3 flex items-center gap-2"><Crown className="w-5 h-5 text-[#d4a847]" />Keunggulan Premium</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><div className="glass rounded-xl p-5 border border-[#d4a847]/20"><div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-[#d4a847]" /><h4 className="font-heading text-sm font-bold text-[#f5f0e8]">Bebas Iklan</h4></div><p className="text-xs text-[#8a8278]">Nikmati konten tanpa gangguan iklan.</p></div><div className="glass rounded-xl p-5 border border-[#d4a847]/20"><div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-[#d4a847]" /><h4 className="font-heading text-sm font-bold text-[#f5f0e8]">Akses Eksklusif</h4></div><p className="text-xs text-[#8a8278]">Dapatkan akses ke konten eksklusif dan rilis awal.</p></div><div className="glass rounded-xl p-5 border border-[#d4a847]/20"><div className="flex items-center gap-2 mb-2"><Globe className="w-4 h-4 text-[#d4a847]" /><h4 className="font-heading text-sm font-bold text-[#f5f0e8]">Dukungan Prioritas</h4></div><p className="text-xs text-[#8a8278]">Dapatkan dukungan prioritas dari tim kami.</p></div></div></div>
          <div><h2 className="font-heading text-xl font-bold text-[#f5f0e8] mb-3 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-[#d4a847]" />FAQ (Pertanyaan Umum)</h2><div className="space-y-3">{faqs.map((faq, idx) => <div key={idx} className="glass rounded-xl p-4 border border-[#2a2a2a]/50"><h4 className="font-heading text-sm font-bold text-[#f5f0e8] mb-1">{faq.q}</h4><p className="text-sm text-[#8a8278]">{faq.a}</p></div>)}</div></div>
          <div><h2 className="font-heading text-xl font-bold text-[#f5f0e8] mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-[#d4a847]" />Akses Cepat</h2><div className="flex flex-wrap gap-2"><button onClick={() => router.push('/dashboard/settings')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] hover:border-[#d4a847]/30 hover:bg-[#d4a847]/5 transition-colors"><Settings className="w-4 h-4" /><span>Settings</span></button><button onClick={() => router.push('/dashboard/developer')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] hover:border-[#d4a847]/30 hover:bg-[#d4a847]/5 transition-colors"><Code className="w-4 h-4" /><span>Info Dev</span></button><button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] hover:border-[#d4a847]/30 hover:bg-[#d4a847]/5 transition-colors"><Home className="w-4 h-4" /><span>Beranda</span></button></div></div>
          <div className="pt-6 border-t border-[#2a2a2a]/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8a8278]"><div className="flex items-center gap-2"><Database className="w-4 h-4 text-[#d4a847]" /><span>Data diperbarui secara real-time</span></div><div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#d4a847]" /><span>Dikembangkan oleh tim AETHRA</span></div><div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#d4a847]" /><span>support@aethrastream.com</span></div></div>
        </div>
      </div>
    </div>
  );
}
