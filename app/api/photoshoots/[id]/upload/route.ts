import { NextRequest, NextResponse } from 'next/server';
import { requirePhotographer } from '@/lib/auth';
import { supabaseAdmin, STORAGE_BUCKETS } from '@/lib/supabase/admin';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePhotographer();
    const photoshootId = params.id;

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const targetClientId = formData.get('clientId') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No image files selected.' }, { status: 400 });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const storagePath = `${photoshootId}/${cleanId}.${fileExt}`;

      // Upload raw file to Supabase private storage
      await supabaseAdmin.storage
        .from(STORAGE_BUCKETS.ORIGINALS)
        .upload(storagePath, buffer, { contentType: file.type, upsert: true });

      // Create photograph record
      const { data: photo, error: photoErr } = await supabaseAdmin
        .from('photographs')
        .insert({
          photoshoot_id: photoshootId,
          file_name: file.name,
          original_storage_path: storagePath,
          preview_storage_path: storagePath,
          thumbnail_storage_path: storagePath,
          file_size_bytes: file.size,
          mime_type: file.type,
          file_hash_sha256: `hash_${cleanId}`,
          is_group_photo: false,
          processing_status: 'completed',
        })
        .select()
        .single();

      if (photo && targetClientId) {
        // Direct-to-Client Private Folder Assignment!
        await supabaseAdmin.from('client_photo_assignments').insert({
          client_id: targetClientId,
          photograph_id: photo.id,
          match_confidence: 1.0,
          status: 'approved',
          reviewed_by_photographer: true,
        });
      }

      if (photo) uploadedPhotos.push(photo);
    }

    return NextResponse.json({
      success: true,
      uploadedCount: uploadedPhotos.length,
      photos: uploadedPhotos,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to upload individual photos.' }, { status: 500 });
  }
}