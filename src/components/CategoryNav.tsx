'use client';

import React from 'react';
import { Category, CategoryId } from '@/types/menu';
import { Flame, Layers, Sparkles, Coffee, PlusCircle, Heart, Utensils } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (id: CategoryId | 'all') => void;
  productCounts: Record<string, number>;
}

export default function CategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
  productCounts,
}: CategoryNavProps) {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'doner':
        return <Flame className="w-4 h-4" />;
      case 'menu':
        return <Layers className="w-4 h-4" />;
      case 'sos':
        return <Sparkles className="w-4 h-4" />;
      case 'icecek':
        return <Coffee className="w-4 h-4" />;
      case 'malzeme':
        return <PlusCircle className="w-4 h-4" />;
      case 'tatli':
        return <Heart className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  const totalAll = Object.values(productCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="sticky top-[58px] z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 py-2.5 px-4 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {/* All items pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 scale-102'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Tüm Menü</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === 'all'
                ? 'bg-neutral-950/20 text-neutral-950 font-black'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {totalAll}
          </span>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = productCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 scale-102'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-neutral-950/20 text-neutral-950 font-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
