-- ==============================================================================
-- LensVault Seed Data: Sample Photoshoot, 5 Fictional Clients & Photos
-- ==============================================================================

-- 1. Insert Sample Photoshoot
INSERT INTO public.photoshoots (id, photographer_id, title, session_date, location, notes, is_published, status)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'College Portrait Session — October 2026',
    '2026-10-20',
    'The Quad & Library Steps',
    '5 graduate candidates captured across individual and group portrait setups.',
    TRUE,
    'published'
) ON CONFLICT DO NOTHING;

-- 2. Insert 5 Clients with Unique Access Codes & Credentials
-- (Demo password for all 5 clients: "Memory2026!")
-- Hash generated via bcrypt: $2a$12$K1rZc7n9V9ZkX4FjK0qVve7u9Q9K8J6lQoWjO1X9Y2p7L6x2.
INSERT INTO public.clients (id, photoshoot_id, display_name, access_code, email, password_hash, is_active)
VALUES 
    (
        'c1000000-0000-0000-0000-000000000001',
        'a1000000-0000-0000-0000-000000000001',
        'Emma Vance',
        'EMMA-OCT26',
        'emma.vance@example.com',
        '$2a$12$K1rZc7n9V9ZkX4FjK0qVve7u9Q9K8J6lQoWjO1X9Y2p7L6x2.',
        TRUE
    ),
    (
        'c1000000-0000-0000-0000-000000000002',
        'a1000000-0000-0000-0000-000000000001',
        'Liam Chen',
        'LIAM-OCT26',
        'liam.chen@example.com',
        '$2a$12$K1rZc7n9V9ZkX4FjK0qVve7u9Q9K8J6lQoWjO1X9Y2p7L6x2.',
        TRUE
    ),
    (
        'c1000000-0000-0000-0000-000000000003',
        'a1000000-0000-0000-0000-000000000001',
        'Sophia Patel',
        'SOPHIA-OCT26',
        'sophia.patel@example.com',
        '$2a$12$K1rZc7n9V9ZkX4FjK0qVve7u9Q9K8J6lQoWjO1X9Y2p7L6x2.',
        TRUE
    ),
    (
        'c1000000-0000-0000-0000-000000000004',
        'a1000000-0000-0000-0000-000000000001',
        'Marcus Aurelius',
        'MARCUS-OCT26',
        'marcus.aurelius@example.com',
        '$2a$12$K1rZc7n9V9ZkX4FjK0qVve7u9Q9K8J6lQoWjO1X9Y2p7L6x2.',
        TRUE
    ),
    (
        'c1000000-0000-0000-0000-000000000005',
        'a1000000-0000-0000-0000-000000000001',
        'Zoe Washington',
        'ZOE-OCT26',
        'zoe.washington@example.com',
        '$2a$12$K1rZc7n9V9ZkX4FjK0qVve7u9Q9K8J6lQoWjO1X9Y2p7L6x2.',
        TRUE
    )
ON CONFLICT DO NOTHING;

-- 3. Insert Sample Photographs (Solo portraits and 1 group photo)
INSERT INTO public.photographs (id, photoshoot_id, file_name, original_storage_path, preview_storage_path, thumbnail_storage_path, file_size_bytes, mime_type, width, height, file_hash_sha256, is_group_photo, processing_status)
VALUES 
    -- Emma solo photo
    ('p1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'LV_OCT26_001.jpg', 'originals/emma_portrait.jpg', 'previews/emma_portrait.jpg', 'thumbs/emma_portrait.jpg', 8400000, 'image/jpeg', 4000, 6000, 'sha256_hash_1', FALSE, 'completed'),
    -- Liam solo photo
    ('p1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'LV_OCT26_002.jpg', 'originals/liam_portrait.jpg', 'previews/liam_portrait.jpg', 'thumbs/liam_portrait.jpg', 7900000, 'image/jpeg', 4000, 6000, 'sha256_hash_2', FALSE, 'completed'),
    -- Sophia solo photo
    ('p1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'LV_OCT26_003.jpg', 'originals/sophia_portrait.jpg', 'previews/sophia_portrait.jpg', 'thumbs/sophia_portrait.jpg', 8100000, 'image/jpeg', 4000, 6000, 'sha256_hash_3', FALSE, 'completed'),
    -- Marcus solo photo
    ('p1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'LV_OCT26_004.jpg', 'originals/marcus_portrait.jpg', 'previews/marcus_portrait.jpg', 'thumbs/marcus_portrait.jpg', 8300000, 'image/jpeg', 4000, 6000, 'sha256_hash_4', FALSE, 'completed'),
    -- Zoe solo photo
    ('p1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'LV_OCT26_005.jpg', 'originals/zoe_portrait.jpg', 'previews/zoe_portrait.jpg', 'thumbs/zoe_portrait.jpg', 8500000, 'image/jpeg', 4000, 6000, 'sha256_hash_5', FALSE, 'completed'),
    -- GROUP PHOTO (Emma + Liam + Sophia) - demonstrating multi-person assignment!
    ('p1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'LV_OCT26_GROUP_01.jpg', 'originals/group_study.jpg', 'previews/group_study.jpg', 'thumbs/group_study.jpg', 9800000, 'image/jpeg', 6000, 4000, 'sha256_hash_6', TRUE, 'completed')
ON CONFLICT DO NOTHING;

-- 4. Approved Assignments
INSERT INTO public.client_photo_assignments (client_id, photograph_id, match_confidence, status, reviewed_by_photographer)
VALUES 
    -- Solo assignments
    ('c1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 0.942, 'approved', TRUE),
    ('c1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 0.961, 'approved', TRUE),
    ('c1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 0.925, 'approved', TRUE),
    ('c1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', 0.954, 'approved', TRUE),
    ('c1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000005', 0.938, 'approved', TRUE),
    -- Group photo assigned to Emma, Liam, AND Sophia (Never Marcus or Zoe)
    ('c1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000006', 0.890, 'approved', TRUE),
    ('c1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000006', 0.884, 'approved', TRUE),
    ('c1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000006', 0.912, 'approved', TRUE)
ON CONFLICT DO NOTHING;
