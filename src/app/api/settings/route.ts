import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/storage';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ success: false, error: 'Ayarlar alınamadı.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await req.json();
    const updated = updateSettings(body);

    return NextResponse.json({
      success: true,
      message: 'Restoran ayarları kaydedildi.',
      settings: updated,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ success: false, error: 'Ayarlar güncellenemedi.' }, { status: 500 });
  }
}
