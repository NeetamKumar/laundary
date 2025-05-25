import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchStudentProps {
  onSearch: (prn: string) => void;
}

export function SearchStudent({ onSearch }: SearchStudentProps) {
  const [prn, setPrn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prn.trim()) {
      onSearch(prn);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={prn}
          onChange={(e) => setPrn(e.target.value)}
          placeholder="Enter Student PRN"
          className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}