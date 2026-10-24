/**
 * LensVault Core TypeScript Type Definitions
 * Built for Boss - Photography Architecture
 */

export type UserRole = 'photographer' | 'client';

export interface Photoshoot {
  id: string;
  photographer_id: string;
  title: string;
  session_date: string;
  location?: string;
  notes?: string;
  cover_image_url?: string;
  is_published: boolean;
  published_at?: string;
  status: 'draft' | 'processing' | 'review' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  client_count?: number;
  photo_count?: number;
}

export interface Client {
  id: string;
  photoshoot_id: string;
  display_name: string;
  access_code: string;
  email?: string;
  password_hash?: string;
  reference_embedding?: number[];
  reference_image_path?: string;
  is_active: boolean;
  access_expires_at?: string;
  last_login_at?: string;
  download_count: number;
  created_at: string;
  assigned_photo_count?: number;
}

export interface Photograph {
  id: string;
  photoshoot_id: string;
  file_name: string;
  original_storage_path: string;
  preview_storage_path: string;
  thumbnail_storage_path: string;
  file_size_bytes: number;
  mime_type: string;
  width?: number;
  height?: number;
  file_hash_sha256: string;
  is_group_photo: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  created_at: string;
  // Dynamic fields
  signed_url?: string;
  is_favorite?: boolean;
}

export interface DetectedFace {
  id: string;
  photograph_id: string;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  face_crop_storage_path?: string;
  embedding: number[];
  detection_confidence: number;
}

export interface PhotoAssignment {
  id: string;
  client_id: string;
  photograph_id: string;
  detected_face_id?: string;
  match_confidence: number;
  status: 'suggested' | 'approved' | 'rejected' | 'manual_assigned';
  reviewed_by_photographer: boolean;
  is_favorite: boolean;
  created_at: string;
  // Joined fields
  client?: Client;
  photograph?: Photograph;
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
  displayName: string;
  photoshootId?: string; // If client
  accessCode?: string;
  exp: number;
}
