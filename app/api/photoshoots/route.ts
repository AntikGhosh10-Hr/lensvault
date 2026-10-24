import { NextRequest, NextResponse } from 'next/server';
import { requirePhotographer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const session = await requirePhotographer();

    const { data: photoshoots, error } = await supabaseAdmin
      .from('photoshoots')
      .select(`
        *,
        clients:clients(count),
        photographs:photographs(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch photoshoots.' }, { status: 500 });
    }

    const formatted = (photoshoots || []).map((ps: any) => ({
      ...ps,
      client_count: ps.clients?.[0]?.count || 0,
      photo_count: ps.photographs?.[0]?.count || 0,
    }));

    return NextResponse.json({ photoshoots: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePhotographer();
    const { title, session_date, location, notes } = await req.json();

    if (!title || !session_date) {
      return NextResponse.json({ error: 'Title and session date are required.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('photoshoots')
      .insert({
        photographer_id: session.userId,
        title,
        session_date,
        location,
        notes,
        status: 'draft',
        is_published: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create photoshoot.' }, { status: 500 });
    }

    return NextResponse.json({ photoshoot: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
