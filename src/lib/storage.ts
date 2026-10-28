import fs from 'fs';
import path from 'path';
import { Product, RestaurantSettings } from '@/types/menu';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '@/data/initialData';

export interface StorageData {
  products: Product[];
  settings: RestaurantSettings;
  adminPasswordHash?: string;
}

// In-memory cache for fast access & serverless runtime stability
let memoryCache: StorageData | null = null;

function getStoreFilePath(): string {
  // Use /tmp in production serverless (like Vercel) if root directory is read-only
  const isVercel = process.env.VERCEL === '1';
  if (isVercel) {
    return path.join('/tmp', 'mtdoner-store.json');
  }
  const dataDir = path.join(process.cwd(), 'data');
  return path.join(dataDir, 'menu-store.json');
}

export function getStorageData(): StorageData {
  if (memoryCache) {
    return memoryCache;
  }

  const filePath = getStoreFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content) as StorageData;
      if (parsed && Array.isArray(parsed.products) && parsed.settings) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Storage read warning, falling back to initial data:', error);
  }

  // Fallback to initial seeds
  const defaultData: StorageData = {
    products: INITIAL_PRODUCTS,
    settings: INITIAL_SETTINGS,
  };
  memoryCache = defaultData;
  return defaultData;
}

export function saveStorageData(data: StorageData): boolean {
  memoryCache = data;
  const filePath = getStoreFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.warn('Storage write warning (running in read-only environment, kept in memory):', error);
    return true; // Memory cache succeeded
  }
}

export function getAllProducts(): Product[] {
  const data = getStorageData();
  return data.products;
}

export function getProductById(id: string): Product | undefined {
  const products = getAllProducts();
  return products.find((p) => p.id === id);
}

export function addProduct(product: Omit<Product, 'id'> & { id?: string }): Product {
  const data = getStorageData();
  const newProduct: Product = {
    ...product,
    id: product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedProducts = [newProduct, ...data.products];
  saveStorageData({
    ...data,
    products: updatedProducts,
  });

  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const data = getStorageData();
  const index = data.products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedProduct: Product = {
    ...data.products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const updatedProducts = [...data.products];
  updatedProducts[index] = updatedProduct;

  saveStorageData({
    ...data,
    products: updatedProducts,
  });

  return updatedProduct;
}

export function deleteProduct(id: string): boolean {
  const data = getStorageData();
  const filtered = data.products.filter((p) => p.id !== id);
  if (filtered.length === data.products.length) return false;

  saveStorageData({
    ...data,
    products: filtered,
  });

  return true;
}

export function getSettings(): RestaurantSettings {
  const data = getStorageData();
  return data.settings || INITIAL_SETTINGS;
}

export function updateSettings(newSettings: Partial<RestaurantSettings>): RestaurantSettings {
  const data = getStorageData();
  const updatedSettings: RestaurantSettings = {
    ...data.settings,
    ...newSettings,
  };

  saveStorageData({
    ...data,
    settings: updatedSettings,
  });

  return updatedSettings;
}
