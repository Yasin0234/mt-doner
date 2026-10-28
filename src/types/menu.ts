export type CategoryId = 'doner' | 'sos' | 'icecek' | 'malzeme' | 'tatli' | 'menu';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
}

export interface ProductOptionItem {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  description: string;
  image: string;
  isPopular?: boolean;
  isChefSpecial?: boolean;
  isNew?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isAvailable: boolean;
  // Berlin Döner Özel Seçenekleri
  allowedSauces?: string[]; // örn: ['Kräuter (Yeşillikli)', 'Knoblauch (Sarımsaklı)', 'Scharf (Acılı)', 'MT Özel Sos']
  removableIngredients?: string[]; // örn: ['Kırmızı Lahana', 'Domates', 'Salatalık', 'Beyaz Soğan', 'Sumak', 'Göbek Marul']
  availableExtras?: ProductOptionItem[]; // örn: [{ id: 'extra-meat', name: 'Ekstra Döner Eti (+50g)', price: 80 }]
  availableDrinks?: string[]; // Tavsiye edilen içecekler
  availableDesserts?: string[]; // Tavsiye edilen tatlılar
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantSettings {
  name: string;
  slogan: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  address: string;
  wifiName?: string;
  wifiPassword?: string;
  openingHours: string;
  currency: string;
  tableCount: number;
  instagram?: string;
  googleReviewUrl?: string;
}

export interface CartItemOption {
  selectedSauce?: string;
  removedIngredients?: string[];
  addedExtras?: ProductOptionItem[];
  notes?: string;
}

export interface CartItem {
  id: string; // unique cart item instance id
  productId: string;
  name: string;
  price: number;
  unitPrice: number;
  quantity: number;
  image: string;
  options: CartItemOption;
}
