import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { supabaseAdmin, STORAGE_BUCKETS, getSignedImageUrl } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    // 1. Enforce strict server session authorization
    const session = await requireClient();
    const clientId = session.userId;
    const photoshootId = session.photoshootId;

    // 2. Query only APPROVED photographs assigned to this client
    const { data: assignments, error: assignErr } = await supabaseAdmin
      .from('client_photo_assignments')
      .select(`
        id,
        is_favorite,
        match_confidence,
        photographs (
          id,
          file_name,
          preview_storage_path,
          thumbnail_storage_path,
          original_storage_path,
          width,
          height,
          file_size_bytes,
          is_group_photo,
          created_at
        )
      `)
      .eq('client_id', clientId)
      .eq('status', 'approved');

    if (assignErr) {
      return NextResponse.json({ error: 'Failed to retrieve gallery photos.' }, { status: 500 });
    }

    // 3. Fetch photoshoot metadata
    const { data: photoshoot } = await supabaseAdmin
      .from('photoshoots')
      .select('id, title, session_date, location')
      .eq('id', photoshootId!)
      .single();

    // 4. Generate Short-Lived Signed URLs (60 seconds) for private storage access
    const photosWithSignedUrls = await Promise.all(
      (assignments || []).map(async (item: any) => {
        const photo = item.photographs;
        let previewSignedUrl = '';
        let thumbSignedUrl = '';

        try {
          previewSignedUrl = await getSignedImageUrl(
            STORAGE_BUCKETS.PREVIEWS,
            photo.preview_storage_path,
            120 // 2 minutes for active gallery viewing
          );
          thumbSignedUrl = await getSignedImageUrl(
            STORAGE_BUCKETS.THUMBS,
            photo.thumbnail_storage_path,
            120
          );
        } catch {
          // Fallback placeholder if storage is offline
          previewSignedUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80`;
          thumbSignedUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`;
        }

        return {
          id: photo.id,
          assignmentId: item.id,
          fileName: photo.file_name,
          previewUrl: previewSignedUrl,
          thumbnailUrl: thumbSignedUrl,
          width: photo.width,
          height: photo.height,
          fileSize: photo.file_size_bytes,
          isGroupPhoto: photo.is_group_photo,
          isFavorite: item.is_favorite,
          matchConfidence: item.match_confidence,
        };
      })
    );

    return NextResponse.json({
      photoshoot: photoshoot,
      clientName: session.displayName,
      totalPhotos: photosWithSignedUrls.length,
      photos: photosWithSignedUrls,
    });
  } catch (err: any) {
    if (err.message.includes('UNAUTHORIZED')) {
      return NextResponse.json({ error: 'Unauthorized gallery access.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error processing gallery.' }, { status: 500 });
  }
}

// Toggle Favorite Status
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireClient();
    const { photoId, isFavorite } = await req.json();

    const { error } = await supabaseAdmin
      .from('client_photo_assignments')
      .update({ is_favorite: Boolean(isFavorite), updated_at: new Date().toISOString() })
      .eq('client_id', session.userId)
      .eq('photograph_id', photoId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update favorite status.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, isFavorite });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unauthorized favorite operation.' }, { status: 401 });
  }
}
