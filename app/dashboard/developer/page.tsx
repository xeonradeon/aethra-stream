'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Code, Award, Zap, Calendar, Sparkles, BookOpen, Star, Crown, Github, Twitter, Linkedin, Mail, User, Clock, Globe, Smartphone, Link, Hash, FolderOpen, Rocket } from 'lucide-react';

export default function DeveloperPage() {
  const router = useRouter();

  const devInfo = {
    name: '『 𓅯 』𝙭𝙚𝙤𝙣 - 𝙧𝙖𝙙𝙚𝙤𝙣',
    avatar: 'https://qu.ax/WVCCI.jpg',
    age: '19',
    birthdate: '2006-09-08',
    coreFocus: 'Building & Designing / Algorithmic Engineering (Full Stack)',
    hobbies: ['System Development & Optimization', 'Digital Art/Pixelation (Vector and Raster)', 'Exploration & Research (New Architectures)'],
    project: { status: 'Active Deployment', version: 'Stable Version', name: 'AETHRA STREAM' },
  };

  const channelInfo = {
    name: '𝐗𝐞𝐨𝐧 𝐅𝐨𝐫𝐮𝐦 🪽',
    description: 'Private channel · Development · Release\nChannel pribadi untuk update project, rilis fitur, dan catatan pengembangan.',
    mainWeb: ['xeon-profile.vercel.app'],
    mainApp: { name: 'APK AETHRA STREAM', url: 'https://sfile.co/jSMeUt18Scq' },
    links: [{ name: 'TikTok', url: 'https://www.tiktok.com/@x.radeonn' }, { name: 'WhatsApp', url: 'https://wa.me/+6285943315159' }, { name: 'Instagram', url: 'https://www.instagram.com/x.radeonn' }],
    channelId: '120363423952802889@newsletter',
    channelLink: 'https://whatsapp.com/channel/0029VbCPV4LD38CRe4mWZd3F',
    categories: ['Development Logs', 'Project Release Notes', 'Experimental Build Previews', 'API Documentation & Updates', 'Resource & Tool Announcements'],
  };

  const techStack = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Node.js', 'Python', 'Docker'];

  const stats = [
    { label: 'Age', value: devInfo.age, icon: <User className="w-4 h-4" /> },
    { label: 'Birthdate', value: devInfo.birthdate, icon: <Calendar className="w-4 h-4" /> },
    { label: 'Status', value: devInfo.project.status, icon: <Zap className="w-4 h-4" /> },
    { label: 'Version', value: devInfo.project.version, icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#8a8278] hover:text-[#f5f0e8] transition-colors"><ChevronLeft className="w-4 h-4" /><span className="text-sm">Kembali</span></button>
      <div className="flex items-center justify-between"><h1 className="font-heading text-2xl md:text-3xl font-bold text-[#f5f0e8] flex items-center gap-3"><Code className="w-7 h-7 text-[#d4a847]" />Developer Info</h1><span className="text-xs text-[#8a8278] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d4a847] animate-pulse" />Active</span></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="glass-gold rounded-2xl p-6 border border-[#d4a847]/20 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#d4a847]/30 overflow-hidden mb-4"><img src={devInfo.avatar} alt={devInfo.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'flex'; e.currentTarget.style.alignItems = 'center'; e.currentTarget.style.justifyContent = 'center'; e.currentTarget.style.background = 'linear-gradient(to right, #d4a847, #b8942e)'; e.currentTarget.textContent = 'X'; e.currentTarget.style.fontSize = '2rem'; e.currentTarget.style.fontWeight = 'bold'; e.currentTarget.style.color = '#0a0a0a'; }} /></div>
            <h2 className="font-heading text-lg font-bold text-[#f5f0e8]">{devInfo.name}</h2>
            <p className="text-sm text-[#8a8278] mt-1">{devInfo.coreFocus}</p>
            <div className="flex items-center gap-3 mt-4"><a href="#" className="p-2 rounded-lg hover:bg-[#d4a847]/10 transition-colors"><Github className="w-5 h-5 text-[#8a8278] hover:text-[#d4a847]" /></a><a href="#" className="p-2 rounded-lg hover:bg-[#d4a847]/10 transition-colors"><Twitter className="w-5 h-5 text-[#8a8278] hover:text-[#d4a847]" /></a><a href="#" className="p-2 rounded-lg hover:bg-[#d4a847]/10 transition-colors"><Linkedin className="w-5 h-5 text-[#8a8278] hover:text-[#d4a847]" /></a><a href="#" className="p-2 rounded-lg hover:bg-[#d4a847]/10 transition-colors"><Mail className="w-5 h-5 text-[#8a8278] hover:text-[#d4a847]" /></a></div>
          </div>
          <div className="mt-6 space-y-3 border-t border-[#2a2a2a]/50 pt-4">{stats.map((stat) => <div key={stat.label} className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm text-[#8a8278]">{stat.icon}<span>{stat.label}</span></div><span className="text-sm text-[#f5f0e8]">{stat.value}</span></div>)}</div>
          <div className="mt-4 p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30"><p className="text-xs text-[#8a8278] text-center"><span className="text-[#d4a847]">✦</span> AETHRA STREAM v1.0.0</p></div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="glass rounded-2xl p-6 border border-[#2a2a2a]/50 lg:col-span-2 space-y-6">
          <div><h3 className="font-heading text-lg font-bold text-[#f5f0e8] flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-[#d4a847]" />Hobbies & Interests</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{devInfo.hobbies.map((hobby, index) => <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 hover:border-[#d4a847]/30 transition-colors"><div className="w-2 h-2 rounded-full bg-[#d4a847]" /><span className="text-sm text-[#f5f0e8]">{hobby}</span></div>)}</div></div>
          <div><h3 className="font-heading text-lg font-bold text-[#f5f0e8] flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-[#d4a847]" />Current Project</h3><div className="glass-gold rounded-xl p-4 border border-[#d4a847]/20"><div className="flex items-center justify-between flex-wrap gap-2"><div><h4 className="font-heading text-xl font-bold text-[#d4a847]">{devInfo.project.name}</h4><p className="text-sm text-[#8a8278]">Platform Streaming Premium</p></div><div className="flex items-center gap-2"><span className="px-3 py-1 rounded-full text-xs font-medium bg-[#d4a847]/20 text-[#d4a847] border border-[#d4a847]/30">{devInfo.project.status}</span><span className="px-3 py-1 rounded-full text-xs font-medium bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">{devInfo.project.version}</span></div></div><div className="mt-3 flex items-center gap-2 text-sm text-[#8a8278] border-t border-[#2a2a2a]/30 pt-3"><Clock className="w-4 h-4" /><span>Last updated: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div></div></div>
          <div><h3 className="font-heading text-lg font-bold text-[#f5f0e8] flex items-center gap-2 mb-3"><Zap className="w-5 h-5 text-[#d4a847]" />Tech Stack</h3><div className="flex flex-wrap gap-2">{techStack.map((tech) => <span key={tech} className="px-3 py-1 rounded-full text-xs font-medium bg-[#d4a847]/10 text-[#d4a847] border border-[#d4a847]/20">{tech}</span>)}</div></div>
          <div><h3 className="font-heading text-lg font-bold text-[#f5f0e8] flex items-center gap-2 mb-4"><Rocket className="w-5 h-5 text-[#d4a847]" />Channel Info</h3><div className="glass-gold rounded-xl p-4 border border-[#d4a847]/20 space-y-4">
            <div><h4 className="font-heading text-lg font-bold text-[#d4a847]">{channelInfo.name}</h4><p className="text-sm text-[#8a8278] whitespace-pre-line">{channelInfo.description}</p></div>
            <div><div className="flex items-center gap-2 text-sm text-[#8a8278] mb-2"><Globe className="w-4 h-4" /><span className="font-medium text-[#f5f0e8]">Main Web</span></div><div className="flex flex-wrap gap-2">{channelInfo.mainWeb.map((url, idx) => <a key={idx} href={`https://${url}`} target="_blank" rel="noopener noreferrer" className={`text-xs px-3 py-1 rounded-full border transition-colors ${url === 'xeon-profile.vercel.app' ? 'bg-[#d4a847]/20 text-[#d4a847] border-[#d4a847]/30' : 'bg-[#0a0a0a]/50 text-[#8a8278] border-[#2a2a2a]/30 hover:text-[#d4a847] hover:border-[#d4a847]/30'}`}>{url}</a>)}</div></div>
            <div><div className="flex items-center gap-2 text-sm text-[#8a8278] mb-2"><Smartphone className="w-4 h-4" /><span className="font-medium text-[#f5f0e8]">Main App</span></div><a href={channelInfo.mainApp.url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-full bg-[#d4a847]/20 text-[#d4a847] border border-[#d4a847]/30 hover:bg-[#d4a847]/30 transition-colors inline-block">📱 {channelInfo.mainApp.name}</a></div>
            <div><div className="flex items-center gap-2 text-sm text-[#8a8278] mb-2"><Link className="w-4 h-4" /><span className="font-medium text-[#f5f0e8]">Social Links</span></div><div className="flex flex-wrap gap-2">{channelInfo.links.map((link, idx) => <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-full bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-[#8a8278] hover:text-[#d4a847] hover:border-[#d4a847]/30 transition-colors">{link.name}</a>)}</div></div>
            <div><div className="flex items-center gap-2 text-sm text-[#8a8278] mb-2"><Hash className="w-4 h-4" /><span className="font-medium text-[#f5f0e8]">Channel</span></div><div className="flex flex-col gap-1"><span className="text-xs text-[#8a8278]">ID: {channelInfo.channelId}</span><a href={channelInfo.channelLink} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-full bg-[#d4a847]/10 text-[#d4a847] border border-[#d4a847]/20 hover:bg-[#d4a847]/20 transition-colors inline-block w-fit">{channelInfo.channelLink}</a></div></div>
            <div><div className="flex items-center gap-2 text-sm text-[#8a8278] mb-2"><FolderOpen className="w-4 h-4" /><span className="font-medium text-[#f5f0e8]">Content Categories</span></div><div className="flex flex-wrap gap-1">{channelInfo.categories.map((cat, idx) => <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4a847]/5 text-[#8a8278] border border-[#2a2a2a]/30">{cat}</span>)}</div></div>
          </div></div>
          <div className="p-4 rounded-lg bg-[#d4a847]/5 border border-[#d4a847]/10 text-center"><p className="text-sm text-[#8a8278] italic">"Building the future, one line of code at a time."</p><p className="text-xs text-[#d4a847] mt-1">— 『 𓅯 』𝙭𝙚𝙤𝙣 - 𝙧𝗮𝙙𝙚𝙤𝙣</p></div>
        </motion.div>
      </div>
    </div>
  );
}
