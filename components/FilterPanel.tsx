import React from 'react';
import { Filter } from 'lucide-react';

export default function FilterPanel({
  category,
  setCategory,
  sort,
  setSort,
  priceRange,
  setPriceRange,
}: {
  category: string;
  setCategory: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
}) {
  const categories = ['All', 'SaaS', 'Portfolio', 'E-commerce', 'Blog', 'Dashboard', 'Agency'];
  const sorts = [
    { value: 'sales', label: 'Most Sold' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  return (
    <aside className="hidden md:block w-72 shrink-0">
      <div className="sticky top-6 rounded-[1.6rem] border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-5">
          <Filter size={16} className="text-white/40" />
          <h3 className="text-sm font-display font-bold">Advanced Filters</h3>
        </div>

        <div className="mb-6">
          <label className="text-[11px] uppercase tracking-[0.12em] text-white/30 mb-3 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${category === c ? 'bg-white text-black border-white' : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-[11px] uppercase tracking-[0.12em] text-white/30 mb-3 block">Sort By</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white/70 focus:outline-none focus:border-white/30"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#0a0a0a]">{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-[0.12em] text-white/30 mb-3 block">Price Range</label>
          <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
            <span>₹{priceRange[0]}</span>
            <span>—</span>
            <span>₹{priceRange[1]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-white"
          />
        </div>
      </div>
    </aside>
  );
}
