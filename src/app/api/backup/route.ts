import { NextRequest, NextResponse } from 'next/server';
import { getStorageData, saveStorageData, StorageData } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const data = getStorageData();
    // Exclude password hash from exported backup file for security
    const exportData = {
      exportedAt: new Date().toISOString(),
      products: data.products,
      settings: data.settings,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mt-doner-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json({ success: false, error: 'Yedek alınamadı.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await req.json();
    if (!body || !Array.isArray(body.products)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz yedek dosyası formatı.' },
        { status: 400 }
      );
    }

    const currentData = getStorageData();
    const updatedData: StorageData = {
      ...currentData,
      products: body.products,
      settings: body.settings || currentData.settings,
    };

    saveStorageData(updatedData);

    return NextResponse.json({
      success: true,
      message: `${body.products.length} ürün ve ayarlar başarıyla geri yüklendi!`,
    });
  } catch (error) {
    console.error('Backup import error:', error);
    return NextResponse.json(
      { success: false, error: 'Yedek geri yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
