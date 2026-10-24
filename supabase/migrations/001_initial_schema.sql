-- ==============================================================================
-- LensVault Database Schema & Row-Level Security Policies
-- Built for Boss - Production Photography Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Photoshoots Table
CREATE TABLE IF NOT EXISTS public.photoshoots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    cover_image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'review', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Client Profiles (Photographer's clients for photoshoots)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photoshoot_id UUID NOT NULL REFERENCES public.photoshoots(id) ON DELETE CASCADE,
    display_name VARCHAR(150) NOT NULL,
    access_code VARCHAR(32) NOT NULL, -- Unique gallery access code (e.g., LV-7842)
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL, -- bcrypt/argon2 hash for gallery entry
    reference_embedding JSONB,           -- 512D or 128D reference facial vector
    reference_image_path TEXT,          -- Path to reference face selfie/portrait in private bucket
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    access_expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    download_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_photoshoot_access_code UNIQUE (photoshoot_id, access_code)
);

-- 3. Photographs Table (All raw uploads)
CREATE TABLE IF NOT EXISTS public.photographs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photoshoot_id UUID NOT NULL REFERENCES public.photoshoots(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_storage_path TEXT NOT NULL,  -- Private storage path (lensvault-originals/...)
    preview_storage_path TEXT NOT NULL,   -- Private preview path (lensvault-previews/...)
    thumbnail_storage_path TEXT NOT NULL, -- Private thumbnail path (lensvault-thumbs/...)
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INT,
    height INT,
    file_hash_sha256 VARCHAR(64) NOT NULL, -- Deduplication hash
    is_group_photo BOOLEAN NOT NULL DEFAULT FALSE,
    processing_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Detected Faces (Bounding boxes, embeddings, and confidence per photograph)
CREATE TABLE IF NOT EXISTS public.detected_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photograph_id UUID NOT NULL REFERENCES public.photographs(id) ON DELETE CASCADE,
    bounding_box JSONB NOT NULL,         -- { "x": 120, "y": 80, "width": 140, "height": 140 }
    face_crop_storage_path TEXT,        -- Crop thumbnail for quick review UI
    embedding JSONB NOT NULL,            -- 512-dimensional vector descriptor
    detection_confidence REAL NOT NULL, -- Face detection score (e.g., 0.985)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Client Photo Assignments (The core Many-to-Many junction)
-- NOTE: A single photo can belong to multiple clients (group photos)
CREATE TABLE IF NOT EXISTS public.client_photo_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    photograph_id UUID NOT NULL REFERENCES public.photographs(id) ON DELETE CASCADE,
    detected_face_id UUID REFERENCES public.detected_faces(id) ON DELETE SET NULL,
    match_confidence REAL NOT NULL,     -- Cosine similarity score (e.g., 0.884)
    status VARCHAR(50) NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'rejected', 'manual_assigned')),
    reviewed_by_photographer BOOLEAN NOT NULL DEFAULT FALSE,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE, -- Client can favorite
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_client_photo UNIQUE (client_id, photograph_id)
);

-- 6. Download & Activity Audit Logs (Security & Compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- 'client_login', 'single_download', 'bulk_zip_download', 'access_denied', 'gallery_published'
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    photoshoot_id UUID REFERENCES public.photoshoots(id) ON DELETE SET NULL,
    photograph_id UUID REFERENCES public.photographs(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_clients_photoshoot ON public.clients(photoshoot_id);
CREATE INDEX IF NOT EXISTS idx_clients_access_code ON public.clients(access_code);
CREATE INDEX IF NOT EXISTS idx_photos_photoshoot ON public.photographs(photoshoot_id);
CREATE INDEX IF NOT EXISTS idx_assignments_client ON public.client_photo_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_assignments_photo ON public.client_photo_assignments(photograph_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.client_photo_assignments(status);
CREATE INDEX IF NOT EXISTS idx_faces_photo ON public.detected_faces(photograph_id);
CREATE INDEX IF NOT EXISTS idx_audit_client ON public.audit_logs(client_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Clients can NEVER view another client's photographs
-- ==============================================================================
ALTER TABLE public.photoshoots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photographs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photo_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if caller is authenticated photographer/admin
CREATE OR REPLACE FUNCTION public.is_photographer()
RETURNS BOOLEAN AS $$
BEGIN
    -- Checks Supabase auth metadata or role
    RETURN (auth.jwt() ->> 'role' = 'photographer' OR auth.jwt() ->> 'role' = 'service_role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Photoshoots RLS
CREATE POLICY "Photographer has full access to photoshoots"
    ON public.photoshoots
    FOR ALL
    USING (public.is_photographer());

CREATE POLICY "Clients can view their published photoshoot header only"
    ON public.photoshoots
    FOR SELECT
    USING (
        is_published = TRUE AND
        id IN (
            SELECT photoshoot_id FROM public.clients 
            WHERE id = (auth.jwt() ->> 'client_id')::UUID 
            AND is_active = TRUE
        )
    );

-- 2. Clients RLS
CREATE POLICY "Photographer manages all client profiles"
    ON public.clients
    FOR ALL
    USING (public.is_photographer());

CREATE POLICY "Client can view their own profile only"
    ON public.clients
    FOR SELECT
    USING (id = (auth.jwt() ->> 'client_id')::UUID);

-- 3. Photographs RLS
CREATE POLICY "Photographer has full access to all photographs"
    ON public.photographs
    FOR ALL
    USING (public.is_photographer());

CREATE POLICY "Client can ONLY view photographs approved and assigned to them"
    ON public.photographs
    FOR SELECT
    USING (
        id IN (
            SELECT photograph_id 
            FROM public.client_photo_assignments a
            JOIN public.clients c ON a.client_id = c.id
            JOIN public.photoshoots p ON c.photoshoot_id = p.id
            WHERE a.client_id = (auth.jwt() ->> 'client_id')::UUID
            AND a.status = 'approved'
            AND p.is_published = TRUE
            AND c.is_active = TRUE
        )
    );

-- 4. Client Photo Assignments RLS
CREATE POLICY "Photographer manages all assignments"
    ON public.client_photo_assignments
    FOR ALL
    USING (public.is_photographer());

CREATE POLICY "Client can view only their approved assignments"
    ON public.client_photo_assignments
    FOR SELECT
    USING (
        client_id = (auth.jwt() ->> 'client_id')::UUID 
        AND status = 'approved'
    );

CREATE POLICY "Client can toggle favorite on their own photos"
    ON public.client_photo_assignments
    FOR UPDATE
    USING (client_id = (auth.jwt() ->> 'client_id')::UUID)
    WITH CHECK (client_id = (auth.jwt() ->> 'client_id')::UUID);

-- 5. Detected Faces RLS (Photographer only, sensitive biometric embeddings hidden from clients)
CREATE POLICY "Photographer only access to facial embeddings"
    ON public.detected_faces
    FOR ALL
    USING (public.is_photographer());

-- 6. Audit Logs RLS
CREATE POLICY "Photographer views audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (public.is_photographer());

CREATE POLICY "Server can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    WITH CHECK (TRUE);
