import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, addProduct, getSettings } from '@/lib/storage';
import { INITIAL_CATEGORIES } from '@/data/initialData';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const products = getAllProducts();
    const settings = getSettings();
    return NextResponse.json({
      success: true,
      products,
      categories: INITIAL_CATEGORIES,
      settings,
    });
  } catch (error) {
    console.error('Fetch menu error:', error);
    return NextResponse.json(
      { success: false, error: 'Menü verisi alınamadı.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için admin yetkisi gereklidir.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, category, price, description, image } = body;

    if (!name || !category || price === undefined || !description) {
      return NextResponse.json(
        { success: false, error: 'Lütfen ürün adı, kategori, fiyat ve açıklama alanlarını doldurun.' },
        { status: 400 }
      );
    }

    const newProduct = addProduct({
      name,
      category,
      price: Number(price),
      description,
      image: image || 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
      isPopular: !!body.isPopular,
      isChefSpecial: !!body.isChefSpecial,
      isNew: !!body.isNew,
      isSpicy: !!body.isSpicy,
      isVegetarian: !!body.isVegetarian,
      isAvailable: body.isAvailable !== false,
      allowedSauces: Array.isArray(body.allowedSauces) ? body.allowedSauces : [],
      removableIngredients: Array.isArray(body.removableIngredients) ? body.removableIngredients : [],
      availableExtras: Array.isArray(body.availableExtras) ? body.availableExtras : [],
    });

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla eklendi.',
      product: newProduct,
    });
  } catch (error) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { success: false, error: 'Ürün eklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
