'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchInput({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative">
      <div className="flex items-center w-full h-16 bg-white chunky-border rounded-full px-6 gap-3 chunky-shadow">
        <span className="material-symbols-outlined text-primary text-2xl">
          {isPending ? 'sync' : 'search'}
        </span>
        <input 
          className="flex-1 bg-transparent border-none focus:ring-0 font-hanken text-black placeholder:text-secondary font-bold focus:outline-none" 
          placeholder="Search delicious food..." 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button 
          type="submit"
          className="w-10 h-10 flex items-center justify-center bg-pastel-peach rounded-full chunky-border active-chunky"
        >
          <span className="material-symbols-outlined text-primary">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}
