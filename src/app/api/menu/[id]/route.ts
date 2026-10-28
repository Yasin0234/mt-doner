import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, deleteProduct, getProductById } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const product = getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Ürün bulunamadı.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ success: false, error: 'Ürün alınamadı.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için admin yetkisi gereklidir.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const updated = updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Güncellenecek ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Ürün güncellendi.',
      product: updated,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: 'Ürün güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için admin yetkisi gereklidir.' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const deleted = deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Silinecek ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla silindi.',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ success: false, error: 'Ürün silinemedi.' }, { status: 500 });
  }
}
