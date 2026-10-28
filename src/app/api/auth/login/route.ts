import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  verifyAdminPassword,
  createSessionToken,
  setAuthCookie,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Çok fazla hatalı deneme yapıldı. Lütfen ${rateCheck.remainingSeconds} saniye sonra tekrar deneyin.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Şifre alanı boş bırakılamaz.' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: 'Girdiğiniz admin şifresi hatalı!' },
        { status: 401 }
      );
    }

    recordSuccessfulAttempt(ip);
    const token = createSessionToken();
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası meydana geldi.' },
      { status: 500 }
    );
  }
}
