'use client';

import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  onSortChange: (sort: string) => void;
  filters?: {
    status?: string;
    genre?: string;
    country?: string;
    type?: string;
    order?: string;
  };
}

export function FilterBar({ onFilterChange, onSortChange, filters = {} }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [sort, setSort] = useState('latest');

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange(value);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  return (
    <div className="glass rounded-xl p-4 mb-6 border border-[#2a2a2a]/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d4a847]/10 text-[#d4a847] border border-[#d4a847]/20 hover:bg-[#d4a847]/20 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {(Object.keys(localFilters).length > 0 || sort !== 'latest') && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#8a8278] hover:text-[#d4a847] transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] outline-none"
          >
            <option value="latest">Terbaru</option>
            <option value="popular">Populer</option>
            <option value="rating">Rating Tertinggi</option>
            <option value="title">A-Z</option>
          </select>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-[#2a2a2a]/30">
          {filters.status !== undefined && (
            <div>
              <label className="block text-xs text-[#8a8278] mb-1">Status</label>
              <select
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] outline-none"
              >
                <option value="">Semua</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          {filters.genre !== undefined && (
            <div>
              <label className="block text-xs text-[#8a8278] mb-1">Genre</label>
              <select
                value={localFilters.genre || ''}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] outline-none"
              >
                <option value="">Semua</option>
                <option value="action">Action</option>
                <option value="adventure">Adventure</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="fantasy">Fantasy</option>
                <option value="romance">Romance</option>
                <option value="sci-fi">Sci-Fi</option>
              </select>
            </div>
          )}
          {filters.country !== undefined && (
            <div>
              <label className="block text-xs text-[#8a8278] mb-1">Negara</label>
              <select
                value={localFilters.country || ''}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] outline-none"
              >
                <option value="">Semua</option>
                <option value="japan">Japan</option>
                <option value="china">China</option>
                <option value="korea">Korea</option>
                <option value="usa">USA</option>
              </select>
            </div>
          )}
          {filters.type !== undefined && (
            <div>
              <label className="block text-xs text-[#8a8278] mb-1">Tipe</label>
              <select
                value={localFilters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a]/50 border border-[#2a2a2a]/30 text-sm text-[#f5f0e8] outline-none"
              >
                <option value="">Semua</option>
                <option value="tv">TV</option>
                <option value="movie">Movie</option>
                <option value="ona">ONA</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}