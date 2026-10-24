/**
 * LensVault Authentication & Cryptographic Session Security
 * Built for Boss - Multi-Tenant Gallery Isolation
 */

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SessionPayload, UserRole } from './types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'lensvault-production-secret-key-32-bytes-minimum!'
);

const COOKIE_NAME = 'lensvault_session';

// 1. Password Management
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// 2. JWT Session Creation
export async function createSession(payload: Omit<SessionPayload, 'exp'>): Promise<string> {
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7-day session
    .sign(SECRET_KEY);

  // Set HTTP-only secure cookie
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return token;
}

// 3. JWT Session Verification
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

// 4. Revoke / Logout
export async function destroySession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

// 5. Strict Guard Helpers
export async function requirePhotographer(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== 'photographer') {
    throw new Error('UNAUTHORIZED_PHOTOGRAPHER_ACCESS_DENIED');
  }
  return session;
}

export async function requireClient(photoshootId?: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.role !== 'client') {
    throw new Error('UNAUTHORIZED_CLIENT_ACCESS_DENIED');
  }
  if (photoshootId && session.photoshootId !== photoshootId) {
    throw new Error('FORBIDDEN_CROSS_PHOTOSHOOT_ATTEMPT');
  }
  return session;
}
