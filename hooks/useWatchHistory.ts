'use client';

import { useState, useEffect } from 'react';

interface WatchItem {
  id: string;
  title: string;
  url: string;
  poster: string | null;
  type: string;
  source: string;
  timestamp: number;
  progress?: number;
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchItem[]>([]);
  const [recent, setRecent] = useState<WatchItem | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aethra-watch-history');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
        if (parsed.length > 0) {
          setRecent(parsed[0]);
        }
      }
    } catch (e) {}
  }, []);

  const addToHistory = (item: Omit<WatchItem, 'timestamp'>) => {
    const newItem: WatchItem = {
      ...item,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...history.filter(h => h.id !== item.id)].slice(0, 50);
    setHistory(updated);
    setRecent(newItem);
    localStorage.setItem('aethra-watch-history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    setRecent(null);
    localStorage.removeItem('aethra-watch-history');
  };

  const removeFromHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('aethra-watch-history', JSON.stringify(updated));
  };

  const getHistoryBySource = (source: string) => {
    return history.filter(h => h.source === source);
  };

  const getRecentBySource = (source: string) => {
    const filtered = history.filter(h => h.source === source);
    return filtered.length > 0 ? filtered[0] : null;
  };

  return { 
    history, 
    recent, 
    addToHistory, 
    clearHistory, 
    removeFromHistory,
    getHistoryBySource,
    getRecentBySource
  };
}
