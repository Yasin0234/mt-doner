'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/menu';
import { Plus, Flame, Sparkles, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: string;
  onSelect: (product: Product) => void;
}

export default function ProductCard({
  product,
  currency,
  onSelect,
}: ProductCardProps) {
  const hasOptions =
    (product.allowedSauces && product.allowedSauces.length > 0) ||
    (product.removableIngredients && product.removableIngredients.length > 0) ||
    (product.availableExtras && product.availableExtras.length > 0);

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {product.isChefSpecial && (
            <span className="bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3" />
              Şefin Özel
            </span>
          )}
          {product.isPopular && (
            <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3" />
              Çok Satan
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
              Yeni
            </span>
          )}
          {product.isSpicy && (
            <span className="bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              🌶️ Acılı
            </span>
          )}
          {product.isVegetarian && (
            <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              🌱 Vejetaryen
            </span>
          )}
        </div>

        {/* Stock Status */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 font-bold text-xs rounded-full">
              Tükendi
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Quick custom options indicator */}
          {hasOptions && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.allowedSauces && product.allowedSauces.length > 0 && (
                <span className="text-[10px] bg-neutral-800 text-amber-400/90 font-medium px-2 py-0.5 rounded-md border border-neutral-700/60">
                  Sos Seçmeli
                </span>
              )}
              {product.removableIngredients && product.removableIngredients.length > 0 && (
                <span className="text-[10px] bg-neutral-800 text-neutral-400 font-medium px-2 py-0.5 rounded-md border border-neutral-700/60">
                  Malzeme Çıkarılabilir
                </span>
              )}
              {product.availableExtras && product.availableExtras.length > 0 && (
                <span className="text-[10px] bg-neutral-800 text-neutral-400 font-medium px-2 py-0.5 rounded-md border border-neutral-700/60">
                  Ekstra Eklenebilir
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Price & Add Button */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Tutar</span>
            <span className="text-lg font-black text-amber-400">
              {product.price} {currency}
            </span>
          </div>

          <button
            disabled={!product.isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex items-center gap-1.5 bg-neutral-800 group-hover:bg-amber-500 text-white group-hover:text-neutral-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Plus className="w-4 h-4" />
            <span>{hasOptions ? 'Özelleştir' : 'Ekle'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
