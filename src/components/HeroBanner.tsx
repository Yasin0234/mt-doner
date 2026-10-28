'use client';

import React from 'react';
import { Search, Sparkles, Flame, ShieldCheck, Heart } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
}

export default function HeroBanner({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
}: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden pt-4 pb-2 px-4">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Top Badges */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Orijinal Berlin Reçetesi & Taze Üçgen Ekmek</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          Gerçek <span className="gold-gradient-text">Berlin Usulü Döner</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mb-5">
          Özel marine yaprak et, taze çıtır sebzeler ve Almanya usulü taze Kräuter, Knoblauch & Scharf sosları ile benzersiz lezzet.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative mb-4">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Döner, sos, içecek veya tatlı ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-xs text-neutral-400 hover:text-white"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Feature Tags / Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveFilter(activeFilter === 'popular' ? null : 'popular')}
            className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              activeFilter === 'popular'
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>En Çok Satanlar</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'chef' ? null : 'chef')}
            className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              activeFilter === 'chef'
                ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Şefin Spesiyalleri</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'spicy' ? null : 'spicy')}
            className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              activeFilter === 'spicy'
                ? 'bg-red-500 text-white font-bold border-red-400'
                : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <span className="text-red-400">🌶️</span>
            <span>Acılı Sevenler</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'veg' ? null : 'veg')}
            className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              activeFilter === 'veg'
                ? 'bg-emerald-600 text-white font-bold border-emerald-400'
                : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vejetaryen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
