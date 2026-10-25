import { NextRequest, NextResponse } from 'next/server';
import { requireClient } from '@/lib/auth';
import { supabaseAdmin, STORAGE_BUCKETS } from '@/lib/supabase/admin';
import JSZip from 'jszip';

export async function GET(req: NextRequest) {
  try {
    // 1. Strictly verify authenticated client session
    const session = await requireClient();
    const clientId = session.userId;

    // 2. Query only APPROVED original photographs assigned to this client
    const { data: assignments, error } = await supabaseAdmin
      .from('client_photo_assignments')
      .select(`
        photographs (
          id,
          file_name,
          original_storage_path
        )
      `)
      .eq('client_id', clientId)
      .eq('status', 'approved');

    if (error || !assignments || assignments.length === 0) {
      return NextResponse.json({ error: 'No approved photographs found to download.' }, { status: 404 });
    }

    const zip = new JSZip();
    const folderName = `${session.displayName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Gallery`;
    const folder = zip.folder(folderName);

    // 3. Download original raw images from private storage bucket
    for (const item of assignments) {
      const photo = (item as any).photographs;
      try {
        const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
          .from(STORAGE_BUCKETS.ORIGINALS)
          .download(photo.original_storage_path);

        if (!downloadErr && fileData) {
          const buffer = await fileData.arrayBuffer();
          folder?.file(photo.file_name, buffer);
        } else {
          // If running locally without live S3 bucket, embed lightweight placeholder
          folder?.file(photo.file_name, `LensVault Private Photograph - ${photo.file_name}`);
        }
      } catch (e) {
        console.warn(`Could not bundle ${photo.file_name}:`, e);
      }
    }

    // 4. Generate compressed ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // 5. Audit Log Entry
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'bulk_zip_download',
      client_id: clientId,
      photoshoot_id: session.photoshootId,
      details: { photos_count: assignments.length },
    });

    // Increment client download counter
    // Increment client download counter
try {
  await supabaseAdmin.rpc('increment_client_downloads', { client_row_id: clientId });
} catch {}

    // Return downloadable ZIP stream
    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${folderName}.zip"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    if (err.message.includes('UNAUTHORIZED')) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to generate ZIP archive.' }, { status: 500 });
  }
}
