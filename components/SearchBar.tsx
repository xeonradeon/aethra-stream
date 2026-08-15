'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, Crown } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Cari anime, film, komik, atau movie...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl glass border transition-all duration-300 ${
            isFocused
              ? 'border-[#d4a847]/50 shadow-[0_0_30px_rgba(212,168,71,0.1)]'
              : 'border-[#2a2a2a]/50 hover:border-[#2a2a2a]'
          }`}
        >
          <Search className="w-5 h-5 text-[#8a8278] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-[#f5f0e8] placeholder:text-[#8a8278] font-body text-sm md:text-base"
          />
          {query && (
            <motion.button
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-1 rounded-full hover:bg-[#d4a847]/10 transition-colors"
            >
              <X className="w-4 h-4 text-[#8a8278]" />
            </motion.button>
          )}
          <kbd className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-xs text-[#8a8278] font-mono">
            <span>⌘</span>
            <span>K</span>
          </kbd>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#d4a847] to-[#b8942e] text-[#0a0a0a] text-sm font-bold hover:from-[#e8c05a] hover:to-[#c9a03a] transition-all duration-300"
          >
            Cari
          </button>
        </div>
      </form>

      <AnimatePresence>
        {isFocused && query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl glass border border-[#2a2a2a]/50 z-50"
          >
            <div className="flex items-center gap-2 px-3 py-2 text-[#8a8278]">
              <Sparkles className="w-4 h-4 text-[#d4a847]" />
              <span className="text-sm">Tekan Enter untuk mencari "{query}"</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
