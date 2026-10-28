import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getStorageData, saveStorageData } from './storage';

const COOKIE_NAME = 'mtdoner_admin_token';
const DEFAULT_SECRET = process.env.ADMIN_JWT_SECRET || 'mt-berlin-doner-secret-key-2026-secure-ultra-hash';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mtdoner2026';

// In-memory rate limiting to protect against brute force login attacks
interface RateLimitEntry {
  attempts: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.blockedUntil > now) {
    const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  // Reset if block duration passed
  if (entry.attempts >= 5 && entry.blockedUntil <= now) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { attempts: 0, blockedUntil: 0 };
  entry.attempts += 1;

  if (entry.attempts >= 5) {
    // Block for 5 minutes
    entry.blockedUntil = now + 5 * 60 * 1000;
  }

  loginAttempts.set(ip, entry);
}

export function recordSuccessfulAttempt(ip: string) {
  loginAttempts.delete(ip);
}

// Password hashing using SHA-256 with salt
export function hashPassword(password: string, salt: string = 'mt_berlin_salt_2026'): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function getCurrentAdminPasswordHash(): string {
  const data = getStorageData();
  if (data.adminPasswordHash) {
    return data.adminPasswordHash;
  }
  return hashPassword(DEFAULT_ADMIN_PASSWORD);
}

export function setAdminPassword(newPassword: string): boolean {
  if (!newPassword || newPassword.length < 6) {
    return false;
  }
  const data = getStorageData();
  const newHash = hashPassword(newPassword);
  data.adminPasswordHash = newHash;
  return saveStorageData(data);
}

export function verifyAdminPassword(password: string): boolean {
  const currentHash = getCurrentAdminPasswordHash();
  const inputHash = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(currentHash), Buffer.from(inputHash));
}

// Token creation: payload.signature
export function createSessionToken(): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', DEFAULT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', DEFAULT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  try {
    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false; // Expired
    }
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
