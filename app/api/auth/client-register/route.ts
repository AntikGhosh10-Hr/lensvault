import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { eventCode, displayName, email, password } = await req.json();

    if (!eventCode || !displayName || !password) {
      return NextResponse.json(
        { error: 'Event code, your name, and a password are required.' },
        { status: 400 }
      );
    }

    // 1. Find the photoshoot matching this event code
    const { data: photoshoot, error: psErr } = await supabaseAdmin
      .from('photoshoots')
      .select('id, title, is_published')
      .or(`event_code.ilike.${eventCode.trim()},title.ilike.%${eventCode.trim()}%`)
      .single();

    if (psErr || !photoshoot) {
      return NextResponse.json(
        { error: `No active photoshoot found for event code: "${eventCode.toUpperCase()}". Please verify with your photographer.` },
        { status: 404 }
      );
    }

    // 2. Generate a clean access code for this client
    const initials = displayName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'VIP';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const clientAccessCode = `LV-${initials}-${randNum}`;

    // 3. Hash the client's chosen password
    const passwordHash = await hashPassword(password);

    // 4. Insert new client into database
    const { data: newClient, error: clientErr } = await supabaseAdmin
      .from('clients')
      .insert({
        photoshoot_id: photoshoot.id,
        display_name: displayName.trim(),
        access_code: clientAccessCode,
        email: email ? email.trim() : null,
        password_hash: passwordHash,
        is_active: true,
      })
      .select('id, display_name, photoshoot_id')
      .single();

    if (clientErr) {
      return NextResponse.json(
        { error: 'Failed to create your client profile. Please try again.' },
        { status: 500 }
      );
    }

    // 5. Automatically log the client in!
    await createSession({
      userId: newClient.id,
      role: 'client',
      displayName: newClient.display_name,
      photoshootId: newClient.photoshoot_id,
      accessCode: clientAccessCode,
    });

    return NextResponse.json({
      success: true,
      photoshootId: newClient.photoshoot_id,
      displayName: newClient.display_name,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected registration error occurred.' },
      { status: 500 }
    );
  }
}