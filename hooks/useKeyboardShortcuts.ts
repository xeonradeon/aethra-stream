'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K = Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
      
      // Ctrl+H = Go home
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        router.push('/dashboard');
      }
      
      // Escape = Close modals
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('closeModals'));
      }
      
      // Arrow keys for slider
      if (e.key === 'ArrowRight') {
        document.dispatchEvent(new CustomEvent('nextSlide'));
      }
      if (e.key === 'ArrowLeft') {
        document.dispatchEvent(new CustomEvent('prevSlide'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
}
