'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, ProductOptionItem, CartItemOption } from '@/types/menu';
import { X, Plus, Minus, Check, Flame, Sparkles, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  currency: string;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, options: CartItemOption, totalPrice: number) => void;
}

export default function ProductModal({
  product,
  currency,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  // Sauce state: default to first sauce if available
  const [selectedSauce, setSelectedSauce] = useState<string>(
    product.allowedSauces && product.allowedSauces.length > 0
      ? product.allowedSauces[0]
      : ''
  );

  // Removed ingredients state
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);

  // Selected extras state
  const [selectedExtras, setSelectedExtras] = useState<ProductOptionItem[]>([]);

  // Quantity state
  const [quantity, setQuantity] = useState<number>(1);

  // Notes
  const [notes, setNotes] = useState<string>('');

  // Toggle removed ingredient
  const toggleRemovedIngredient = (ing: string) => {
    setRemovedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  // Toggle extra item
  const toggleExtra = (extra: ProductOptionItem) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  // Calculate unit and total price
  const extrasTotal = selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const unitPrice = product.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onAddToCart(
      product,
      quantity,
      {
        selectedSauce: selectedSauce || undefined,
        removedIngredients: removedIngredients.length > 0 ? removedIngredients : undefined,
        addedExtras: selectedExtras.length > 0 ? selectedExtras : undefined,
        notes: notes.trim() || undefined,
      },
      totalPrice
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-white bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-full transition-all border border-neutral-700/50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 no-scrollbar pb-6">
          {/* Top Image */}
          <div className="relative aspect-[16/9] w-full bg-neutral-800">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-black/40" />

            {/* Badges */}
            <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
              {product.isChefSpecial && (
                <span className="bg-amber-500 text-neutral-950 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <Sparkles className="w-3 h-3" /> Şefin Özel Seçimi
                </span>
              )}
              {product.isPopular && (
                <span className="bg-red-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <Flame className="w-3 h-3" /> Çok Satan
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-extrabold text-white leading-tight">
                  {product.name}
                </h2>
                <span className="text-xl font-black text-amber-400 shrink-0">
                  {product.price} {currency}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Section 1: Sauce Selection (Berlin Döner'in ruhu!) */}
            {product.allowedSauces && product.allowedSauces.length > 0 && (
              <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    1. Berlin Usulü Sos Seçimi
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                    Zorunlu
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  {product.allowedSauces.map((sauce) => {
                    const isSelected = selectedSauce === sauce;
                    return (
                      <label
                        key={sauce}
                        onClick={() => setSelectedSauce(sauce)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <span>{sauce}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500 text-neutral-950'
                              : 'border-neutral-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2: Removable Ingredients */}
            {product.removableIngredients && product.removableIngredients.length > 0 && (
              <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-neutral-200 uppercase tracking-wider">
                    2. İstemediğiniz Malzemeler
                  </span>
                  <span className="text-[10px] text-neutral-500">İsteğe Bağlı</span>
                </div>
                <p className="text-[11px] text-neutral-400 mb-3">
                  İstemediğiniz malzemeye dokunarak siparişinizden çıkarabilirsiniz.
                </p>

                <div className="flex flex-wrap gap-2">
                  {product.removableIngredients.map((ing) => {
                    const isRemoved = removedIngredients.includes(ing);
                    return (
                      <button
                        type="button"
                        key={ing}
                        onClick={() => toggleRemovedIngredient(ing)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 font-medium ${
                          isRemoved
                            ? 'bg-red-950/60 border-red-500/80 text-red-300 line-through'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {isRemoved ? <X className="w-3 h-3 text-red-400" /> : <Check className="w-3 h-3 text-emerald-400" />}
                        <span>{ing}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3: Available Extras */}
            {product.availableExtras && product.availableExtras.length > 0 && (
              <div className="bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    3. Ekstra Lezzetler
                  </span>
                  <span className="text-[10px] text-neutral-500">İsteğe Bağlı</span>
                </div>

                <div className="space-y-2 mt-2">
                  {product.availableExtras.map((extra) => {
                    const isSelected = selectedExtras.some((e) => e.id === extra.id);
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleExtra(extra)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/80 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        <span className="font-semibold">{extra.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400">
                            +{extra.price} {currency}
                          </span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500 text-neutral-950'
                                : 'border-neutral-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 4: Special Note */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                Sipariş Notu (Opsiyonel)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Örn: Ekmeği iyice kızarsın, acısı az olsun..."
                maxLength={100}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer: Quantity & Submit Button */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 text-neutral-400 hover:text-white rounded-lg active:bg-neutral-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 text-neutral-400 hover:text-white rounded-lg active:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add To Cart Button */}
          <button
            onClick={handleAdd}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-between"
          >
            <span>Siparişe Ekle</span>
            <span className="bg-neutral-950/20 px-2.5 py-1 rounded-lg text-xs font-black">
              {totalPrice} {currency}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
