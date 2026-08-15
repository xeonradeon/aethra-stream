'use client';

import { useState, useEffect } from 'react';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  poster: string | null;
  type: string;
  source: string;
  timestamp: number;
}

export function useBookmark() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aethra-bookmarks');
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const addBookmark = (item: Omit<BookmarkItem, 'timestamp'>) => {
    const newItem: BookmarkItem = {
      ...item,
      timestamp: Date.now(),
    };
    const updated = [...bookmarks, newItem];
    setBookmarks(updated);
    localStorage.setItem('aethra-bookmarks', JSON.stringify(updated));
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem('aethra-bookmarks', JSON.stringify(updated));
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some(b => b.id === id);
  };

  const toggleBookmark = (item: Omit<BookmarkItem, 'timestamp'>) => {
    if (isBookmarked(item.id)) {
      removeBookmark(item.id);
      return false;
    } else {
      addBookmark(item);
      return true;
    }
  };

  const clearBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem('aethra-bookmarks');
  };

  const getBookmarksBySource = (source: string) => {
    return bookmarks.filter(b => b.source === source);
  };

  return { 
    bookmarks, 
    addBookmark, 
    removeBookmark, 
    isBookmarked, 
    toggleBookmark, 
    clearBookmarks,
    getBookmarksBySource
  };
}
