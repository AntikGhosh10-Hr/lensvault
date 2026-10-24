import { NextRequest, NextResponse } from 'next/server';
import { requirePhotographer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePhotographer();
    const photoshootId = params.id;
    const { publish } = await req.json();

    const isPublished = Boolean(publish);

    const { data, error } = await supabaseAdmin
      .from('photoshoots')
      .update({
        is_published: isPublished,
        status: isPublished ? 'published' : 'draft',
        published_at: isPublished ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', photoshootId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update publication status.' }, { status: 500 });
    }

    // Record audit event
    await supabaseAdmin.from('audit_logs').insert({
      event_type: isPublished ? 'gallery_published' : 'gallery_unpublished',
      photoshoot_id: photoshootId,
      details: { timestamp: new Date().toISOString() },
    });

    return NextResponse.json({ success: true, photoshoot: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
