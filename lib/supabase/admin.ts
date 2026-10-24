/**
 * LensVault Supabase Client & Private Storage Gateway
 * PRIVILEGED SERVER-SIDE ONLY - Never expose service role to browser
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key';

// Server-only Admin Client with Elevated Privileges for Internal Operations
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Storage Buckets Configuration
export const STORAGE_BUCKETS = {
  ORIGINALS: 'lensvault-originals',   // Full resolution RAW/JPG (Private)
  PREVIEWS: 'lensvault-previews',     // High-res web previews (Private)
  THUMBS: 'lensvault-thumbs',         // Low-res thumbnails (Private)
  CROPS: 'lensvault-face-crops',      // Internal face review crops (Private)
};

/**
 * Generates a short-lived signed URL (60-second expiration)
 * strictly after server-side ownership verification.
 */
export async function getSignedImageUrl(
  bucket: string,
  path: string,
  expiresInSeconds: number = 60
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`STORAGE_SIGNING_FAILED: ${error?.message || 'Unknown error'}`);
  }

  return data.signedUrl;
}
