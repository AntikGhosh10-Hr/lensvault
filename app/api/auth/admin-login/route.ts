import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const ADMIN_EMAIL = process.env.PHOTOGRAPHER_EMAIL || 'boss@lensvault.com';
    const ADMIN_PASSWORD = process.env.PHOTOGRAPHER_PASSWORD || 'LensVault2026!';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      await createSession({
        userId: 'f0000000-0000-0000-0000-000000000001',
        role: 'photographer',
        displayName: 'Boss (Photographer)',
      });

      return NextResponse.json({ success: true, role: 'photographer' });
    }

    return NextResponse.json(
      { error: 'Invalid photographer credentials.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Admin authentication failed.' },
      { status: 500 }
    );
  }
}
