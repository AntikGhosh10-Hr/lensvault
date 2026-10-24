import { NextRequest, NextResponse } from 'next/server';
import { requirePhotographer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePhotographer();
    const photoshootId = params.id;

    // Fetch assignments pending or reviewed for this photoshoot
    const { data: assignments, error } = await supabaseAdmin
      .from('client_photo_assignments')
      .select(`
        id,
        client_id,
        photograph_id,
        match_confidence,
        status,
        reviewed_by_photographer,
        clients (
          id,
          display_name
        ),
        photographs!inner (
          id,
          photoshoot_id,
          file_name,
          preview_storage_path,
          thumbnail_storage_path,
          is_group_photo
        ),
        detected_faces (
          id,
          bounding_box,
          face_crop_storage_path
        )
      `)
      .eq('photographs.photoshoot_id', photoshootId)
      .order('match_confidence', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch review queue.' }, { status: 500 });
    }

    return NextResponse.json({ assignments });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}

// Photographer Approves, Rejects, or Reassigns a Match
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePhotographer();
    const { assignmentId, action, newClientId } = await req.json();

    if (action === 'approve') {
      await supabaseAdmin
        .from('client_photo_assignments')
        .update({ status: 'approved', reviewed_by_photographer: true })
        .eq('id', assignmentId);
    } else if (action === 'reject') {
      await supabaseAdmin
        .from('client_photo_assignments')
        .update({ status: 'rejected', reviewed_by_photographer: true })
        .eq('id', assignmentId);
    } else if (action === 'reassign' && newClientId) {
      await supabaseAdmin
        .from('client_photo_assignments')
        .update({
          client_id: newClientId,
          status: 'approved',
          reviewed_by_photographer: true,
        })
        .eq('id', assignmentId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
}
