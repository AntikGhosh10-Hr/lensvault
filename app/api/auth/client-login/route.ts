import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { accessCode, password } = await req.json();

    if (!accessCode || !password) {
      return NextResponse.json(
        { error: 'Access code and password are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch client by access code
    const { data: client, error: clientErr } = await supabaseAdmin
      .from('clients')
      .select('id, photoshoot_id, display_name, password_hash, is_active, access_expires_at')
      .eq('access_code', accessCode.trim().toUpperCase())
      .single();

    if (clientErr || !client) {
      return NextResponse.json(
        { error: 'Invalid gallery access code.' },
        { status: 401 }
      );
    }

    // 2. Check if client account is active and not expired
    if (!client.is_active) {
      return NextResponse.json(
        { error: 'This gallery access has been suspended or revoked by the photographer.' },
        { status: 403 }
      );
    }

    if (client.access_expires_at && new Date(client.access_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This gallery access has expired. Please contact your photographer.' },
        { status: 403 }
      );
    }

    // 3. Check if photoshoot is published
    const { data: photoshoot } = await supabaseAdmin
      .from('photoshoots')
      .select('is_published')
      .eq('id', client.photoshoot_id)
      .single();

    if (!photoshoot?.is_published) {
      return NextResponse.json(
        { error: 'Your private gallery is currently being curated and has not been published yet.' },
        { status: 403 }
      );
    }

    // 4. Verify Password
    const passwordMatch = await verifyPassword(password, client.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Incorrect gallery password.' },
        { status: 401 }
      );
    }

    // 5. Create Cryptographically Signed Session Cookie
    await createSession({
      userId: client.id,
      role: 'client',
      displayName: client.display_name,
      photoshootId: client.photoshoot_id,
      accessCode: accessCode.trim().toUpperCase(),
    });

    // 6. Record Audit Log
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'client_login',
      client_id: client.id,
      photoshoot_id: client.photoshoot_id,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: req.headers.get('user-agent'),
      details: { client_name: client.display_name },
    });

    return NextResponse.json({
      success: true,
      photoshootId: client.photoshoot_id,
      displayName: client.display_name,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
