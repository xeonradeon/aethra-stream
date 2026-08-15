'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function FloatingSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 p-3 rounded-full glass border border-[#d4a847]/30 shadow-[0_0_20px_rgba(212,168,71,0.1)] transition-all duration-200 hover:scale-105"
      >
        <Search className="w-5 h-5 text-[#d4a847]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div ref={modalRef} className="relative w-full max-w-md">
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3 rounded-xl glass border border-[#d4a847]/30">
              <Search className="w-5 h-5 text-[#d4a847]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari..."
                className="flex-1 bg-transparent outline-none text-[#f5f0e8] placeholder:text-[#8a8278]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-[#d4a847]/10 transition-colors"
              >
                <X className="w-4 h-4 text-[#8a8278]" />
              </button>
            </form>
            <button
              type="submit"
              className="mt-4 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#d4a847] to-[#b8942e] text-[#0a0a0a] font-bold hover:from-[#e8c05a] hover:to-[#c9a03a] transition-all duration-200"
            >
              Cari
            </button>
          </div>
        </div>
      )}
    </>
  );
}
