# 📷 LensVault - Private Photographer Photo-Sharing Platform

Built for **Boss** 🚀

**LensVault** is a production-minded, privacy-first private photography gallery platform with automated face detection, 512D facial embedding matching, multi-tenant gallery isolation, and Supabase Row-Level Security (RLS).

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) + TypeScript | Editorial luxury client & photographer interfaces |
| **Styling** | Tailwind CSS + Warm Neutral Editorial Theme | Clean typography, dark luxury aesthetic, responsive |
| **Database** | Supabase PostgreSQL + Row-Level Security | Relational tables, constraints, strict client isolation |
| **Storage** | Private Supabase Storage Buckets | Originals, previews, thumbnails, 60s signed URLs |
| **Computer Vision** | Python 3.10 + FastAPI + InsightFace / ResNet | 512D face embeddings, landmarking, cosine similarity |
| **Authentication** | Cryptographic HTTP-Only JWT (`jose` + `bcrypt`) | Multi-tenant session cookies, brute-force defense |
| **Archival** | JSZip + Server-Side Streaming | Lossless client-isolated ZIP downloads |

---

## 🔒 Security & Privacy Guarantees

1. **Strict Client Isolation:**
   - Client A can **never** access Client B's pictures.
   - Every gallery request enforces server-side JWT session verification.
   - Row-Level Security (RLS) policies in PostgreSQL enforce client boundaries at the database engine level.
2. **Short-Lived Signed URLs:**
   - Raw storage buckets are **100% private**.
   - Image URLs are cryptographically signed with a **60–120 second expiration window**.
3. **No Biometric Data Leaks:**
   - 512-dimensional face embeddings are processed strictly server-side and never returned to browser code.
4. **Group Photo Integrity:**
   - A single group photograph can be approved for multiple clients (e.g., Client A, B, and C) without exposing it to unassigned clients (D and E).
5. **Draft State Protection:**
   - Galleries remain completely locked to clients until the photographer clicks **"Publish Galleries"**.

---

## 🚀 Setup & Local Execution

### 1. Database & Migrations
1. Create a project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run:
   - `supabase/migrations/001_initial_schema.sql` (Creates all tables, indexes, and RLS policies).
   - `supabase/seed.sql` (Inserts the demo photoshoot "College Portrait Session — October 2026" with 5 fictional clients).
3. Create the 4 private storage buckets under **Storage**:
   - `lensvault-originals` (Private)
   - `lensvault-previews` (Private)
   - `lensvault-thumbs` (Private)
   - `lensvault-face-crops` (Private)

### 2. Python Vision Microservice
Inside `face-recognition-service/`:
```bash
cd face-recognition-service
python -m venv venv
venv\Scripts\activate   # (Windows) or source venv/bin/activate (Linux/Mac)
pip install -r requirements.txt
python app.py
```
*The vision API runs at `http://localhost:8000` (Health check at `http://localhost:8000/health`).*

### 3. Next.js Web Application
In the root directory:
```bash
copy .env.example .env.local
# Fill in your Supabase URL and Service Role Key
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the 14 Security Scenarios

Run the automated test suite verifying cross-tenant isolation, group photo assignments, signed URL expiration, and unauthorized access rejection:
```bash
npm test
```

---

## 💰 Estimated Operational Costs

| Service | Free Tier / Low-Cost Allocation | Monthly Estimate |
| :--- | :--- | :--- |
| **Vercel** (Next.js Web App) | Free Hobby Plan (Unlimited requests, 100GB bandwidth) | **$0.00** |
| **Supabase** (Database & Storage) | Free Tier (500MB DB, 1GB Storage, 50k monthly active users) | **$0.00** (or $25/mo Pro if storing >100GB RAW photos) |
| **FastAPI Vision Engine** | Deploy on Render / Railway / Google Cloud Run | **$0.00 – $7.00/mo** |
| **Total Starting Cost** | | **$0.00 – $7.00/month** |

---

## 🔑 Default Credentials (Seed Data)

### Photographer Admin
- **URL:** `/login?role=admin`
- **Email:** `boss@lensvault.com`
- **Password:** `LensVault2026!`

### Fictional Client (Emma Vance)
- **URL:** `/login`
- **Access Code:** `EMMA-OCT26`
- **Password:** `Memory2026!`
