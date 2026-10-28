'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, Category, RestaurantSettings, CartItem, CartItemOption, CategoryId } from '@/types/menu';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '@/data/initialData';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import WaiterModal from '@/components/WaiterModal';
import { Sparkles, Utensils, Shield, Heart } from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<RestaurantSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Modals & Cart states
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWaiterOpen, setIsWaiterOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load menu from API on mount
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.products)) setProducts(data.products);
          if (Array.isArray(data.categories)) setCategories(data.categories);
          if (data.settings) setSettings(data.settings);
        }
      } catch (err) {
        console.warn('API fetch warning, using seed data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      // Special pill filters
      if (activeFilter === 'popular' && !item.isPopular) return false;
      if (activeFilter === 'chef' && !item.isChefSpecial) return false;
      if (activeFilter === 'spicy' && !item.isSpicy) return false;
      if (activeFilter === 'veg' && !item.isVegetarian) return false;

      return true;
    });
  }, [products, selectedCategory, searchQuery, activeFilter]);

  // Product count by category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Add to cart handler
  const handleAddToCart = (
    product: Product,
    quantity: number,
    options: CartItemOption,
    totalPrice: number
  ) => {
    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      name: product.name,
      price: totalPrice,
      unitPrice: totalPrice / quantity,
      quantity,
      image: product.image,
      options,
    };
    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              price: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove single item from cart
  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-20">
      {/* Header */}
      <Header
        settings={settings}
        tableNumber={tableParam}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWaiter={() => setIsWaiterOpen(true)}
      />

      {/* Hero & Search Banner */}
      <HeroBanner
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* Category Pills Navigation */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        productCounts={productCounts}
      />

      {/* Main Product Grid */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/40 rounded-3xl border border-neutral-800/80 p-8">
            <Utensils className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">Aradığınız kriterde ürün bulunamadı</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Arama teriminizi veya kategori filtrenizi değiştirerek tekrar deneyebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveFilter(null);
              }}
              className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={settings.currency || '₺'}
                onSelect={(p) => setActiveProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Customizer Modal */}
      {activeProduct && (
        <ProductModal
          product={activeProduct}
          currency={settings.currency || '₺'}
          onClose={() => setActiveProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart & Order Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={settings.currency || '₺'}
        settings={settings}
        tableNumber={tableParam}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Waiter Service Modal */}
      <WaiterModal
        isOpen={isWaiterOpen}
        onClose={() => setIsWaiterOpen(false)}
        tableNumber={tableParam}
        settings={settings}
      />

      {/* Sticky Bottom Bar on Mobile when Cart has items */}
      {totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-30 animate-bounce">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black text-sm py-3.5 px-5 rounded-2xl shadow-2xl shadow-amber-500/40 flex items-center justify-between border border-amber-300/40"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neutral-950 text-amber-400 text-xs flex items-center justify-center font-black">
                {totalCartCount}
              </span>
              <span>Siparişi İncele</span>
            </div>
            <span className="text-xs bg-neutral-950/20 px-3 py-1 rounded-xl">
              {cartItems.reduce((sum, item) => sum + item.price, 0)} {settings.currency || '₺'}
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950/80 py-8 px-4 text-center text-neutral-500 text-xs">
        <div className="max-w-5xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-neutral-300">
            <span>{settings.name}</span>
            <span>•</span>
            <span className="text-amber-500 font-semibold">{settings.slogan}</span>
          </div>
          <p className="text-[11px] text-neutral-400">{settings.address}</p>
          <div className="pt-2 text-[10px] text-neutral-400">
            QR Web Menü ve Sipariş Sistemi © {new Date().getFullYear()} - Berlin Usulü Döner
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-400 font-bold text-sm">
        M.T. Döner Menüsü Yükleniyor...
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
