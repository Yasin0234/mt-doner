import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, verifyAdminPassword, setAdminPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Mevcut ve yeni şifre gereklidir.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Yeni şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    const isCurrentValid = verifyAdminPassword(currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Mevcut şifreniz hatalı.' },
        { status: 400 }
      );
    }

    const updated = setAdminPassword(newPassword);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Şifre güncellenemedi.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin şifresi başarıyla güncellendi.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
