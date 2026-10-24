import { NextRequest, NextResponse } from 'next/server';
import { requirePhotographer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePhotographer();
    const photoshootId = params.id;

    const { data: clients, error } = await supabaseAdmin
      .from('clients')
      .select('id, display_name, access_code, email, is_active, last_login_at, download_count, created_at')
      .eq('photoshoot_id', photoshootId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch clients.' }, { status: 500 });
    }

    return NextResponse.json({ clients });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePhotographer();
    const photoshootId = params.id;
    const { display_name, email, password } = await req.json();

    if (!display_name || !password) {
      return NextResponse.json({ error: 'Client display name and password are required.' }, { status: 400 });
    }

    // Auto-generate clean, elegant access code (e.g. LV-9824)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const accessCode = `LV-${display_name.slice(0, 3).toUpperCase()}-${randomSuffix}`;
    const passwordHash = await hashPassword(password);

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .insert({
        photoshoot_id: photoshootId,
        display_name: display_name.trim(),
        access_code: accessCode,
        email: email ? email.trim() : null,
        password_hash: passwordHash,
        is_active: true,
      })
      .select('id, display_name, access_code, email, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create client profile.' }, { status: 500 });
    }

    return NextResponse.json({ client });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
