'use client';

import { useState } from 'react';
import { searchAll, SearchResult } from '@/lib/api';

interface SearchBarProps {
  onResultClick: (entityType: string, id: string) => void;
}

export function SearchBar({ onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      const data = await searchAll(value);
      setResults(data);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
        className="w-64 px-4 py-2 bg-white border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700 placeholder-gray-400"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg mt-1 z-50 border border-teal-100">
          {results.map((r) => (
            <div
              key={`${r.entity_type}-${r.id}`}
              onClick={() => onResultClick(r.entity_type, r.id)}
              className="p-3 hover:bg-teal-50 cursor-pointer border-b border-teal-50 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-800">{r.title}</div>
              <div className="text-xs text-teal-600 mt-1">{r.entity_type}</div>
            </div>
          ))}
        </div>
      )}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 w-64 bg-white shadow-lg rounded-lg mt-1 z-50 border border-teal-100 p-3 text-gray-500 text-sm">
          未找到结果
        </div>
      )}
    </div>
  );
}
