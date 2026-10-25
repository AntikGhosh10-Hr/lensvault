'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, Plus, Users, UploadCloud, Check, X, RefreshCw, 
  FolderLock, ImagePlus, ShieldCheck, ExternalLink, CheckCircle2
} from 'lucide-react';

export default function PhotographerAdminDashboard() {
  const router = useRouter();
  
  const [photoshoots, setPhotoshoots] = useState<any[]>([]);
  const [selectedPhotoshoot, setSelectedPhotoshoot] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [reviewAssignments, setReviewAssignments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'photoshoots' | 'clients' | 'upload' | 'review'>('clients');
  const [loading, setLoading] = useState(true);

  // Upload States
  const [targetClientForUpload, setTargetClientForUpload] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Create Client Form
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPass, setNewClientPass] = useState('Memory2026!');

  // Create Photoshoot Form
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-10-25');
  const [newLocation, setNewLocation] = useState('');
  const [newEventCode, setNewEventCode] = useState('OCT2026');

  useEffect(() => {
    fetchPhotoshoots();
  }, []);

  const fetchPhotoshoots = async () => {
    try {
      const res = await fetch('/api/photoshoots');
      if (res.status === 401) {
        router.push('/login?role=admin');
        return;
      }
      const data = await res.json();
      setPhotoshoots(data.photoshoots || []);
      if (data.photoshoots && data.photoshoots.length > 0) {
        setSelectedPhotoshoot(data.photoshoots[0]);
        fetchClients(data.photoshoots[0].id);
        fetchReviewQueue(data.photoshoots[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async (psId: string) => {
    const res = await fetch(`/api/photoshoots/${psId}/clients`);
    const data = await res.json();
    setClients(data.clients || []);
  };

  const fetchReviewQueue = async (psId: string) => {
    const res = await fetch(`/api/photoshoots/${psId}/review`);
    const data = await res.json();
    setReviewAssignments(data.assignments || []);
  };

  const handleUploadIndividualPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0 || !selectedPhotoshoot) return;

    setUploading(true);
    setUploadSuccessMsg('');

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    if (targetClientForUpload) {
      formData.append('clientId', targetClientForUpload.id);
    }

    try {
      const res = await fetch(`/api/photoshoots/${selectedPhotoshoot.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      setUploadSuccessMsg(
        targetClientForUpload
          ? `✓ Uploaded ${data.uploadedCount} photos directly to ${targetClientForUpload.display_name}'s private vault!`
          : `✓ Uploaded ${data.uploadedCount} photos to photoshoot pool!`
      );
      setSelectedFiles(null);
      fetchPhotoshoots();
      if (selectedPhotoshoot) fetchClients(selectedPhotoshoot.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhotoshoot) return;

    const res = await fetch(`/api/photoshoots/${selectedPhotoshoot.id}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: newClientName,
        email: newClientEmail,
        password: newClientPass,
      }),
    });
    if (res.ok) {
      setNewClientName('');
      setNewClientEmail('');
      fetchClients(selectedPhotoshoot.id);
    }
  };

  const handlePublishToggle = async () => {
    if (!selectedPhotoshoot) return;
    const nextState = !selectedPhotoshoot.is_published;
    const res = await fetch(`/api/photoshoots/${selectedPhotoshoot.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish: nextState }),
    });
    if (res.ok) {
      setSelectedPhotoshoot({ ...selectedPhotoshoot, is_published: nextState });
      fetchPhotoshoots();
    }
  };

  return (
    <div className="min-h-screen bg-vault-950 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-vault-800 bg-vault-900/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-vault-accent/40 flex items-center justify-center text-vault-accent">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-serif uppercase tracking-widest text-vault-100 font-semibold">
              LensVault Studio <span className="text-xs text-vault-accent font-mono font-normal">ADMIN</span>
            </h1>
            <p className="text-[11px] text-vault-400">Private Client Vault Manager for Boss</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {selectedPhotoshoot && (
            <button
              onClick={handlePublishToggle}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                selectedPhotoshoot.is_published
                  ? 'bg-rose-500/10 border border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-white'
                  : 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black'
              }`}
            >
              {selectedPhotoshoot.is_published ? 'Unpublish Galleries' : 'Publish Galleries (Live)'}
            </button>
          )}

          <button
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' });
              router.push('/login');
            }}
            className="text-xs text-vault-400 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Active Session Info Bar */}
        {selectedPhotoshoot && (
          <div className="bg-vault-900/60 border border-vault-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                  selectedPhotoshoot.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {selectedPhotoshoot.is_published ? 'Published & Accessible' : 'Draft / Locked'}
                </span>
                <span className="text-xs text-vault-accent font-mono font-semibold">Event Code: {selectedPhotoshoot.event_code || 'OCT2026'}</span>
              </div>
              <h2 className="text-2xl font-serif text-vault-50">{selectedPhotoshoot.title}</h2>
              <p className="text-xs text-vault-400 mt-0.5">{selectedPhotoshoot.session_date} • {selectedPhotoshoot.location || 'Studio Location'}</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 bg-vault-950 p-1 rounded-2xl border border-vault-800">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'clients' ? 'bg-vault-accent text-vault-950 shadow-md' : 'text-vault-400 hover:text-vault-200'
                }`}
              >
                <FolderLock className="w-3.5 h-3.5" /> Client Private Folders ({clients.length})
              </button>
              <button
                onClick={() => {
                  setTargetClientForUpload(null);
                  setActiveTab('upload');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'upload' ? 'bg-vault-accent text-vault-950 shadow-md' : 'text-vault-400 hover:text-vault-200'
                }`}
              >
                <ImagePlus className="w-3.5 h-3.5" /> Upload Loose Photos
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: CLIENT PRIVATE FOLDERS (Boss's Core Need) */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif text-vault-100 flex items-center gap-2">
                  <FolderLock className="w-4 h-4 text-vault-accent" /> Private Client Vaults
                </h3>
                <p className="text-xs text-vault-400">
                  Each client has their own isolated private folder. Click <strong>"Add Photos"</strong> on any client to drop individual pictures directly into their vault!
                </p>
              </div>

              <span className="text-xs text-vault-accent font-mono bg-vault-accent/10 px-3 py-1 rounded-full border border-vault-accent/30">
                {clients.length} Private Client Folders
              </span>
            </div>

            {/* Client Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clients.map(c => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl border border-vault-800 bg-vault-900/80 flex flex-col justify-between space-y-4 hover:border-vault-accent/40 transition shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-vault-accent/10 border border-vault-accent/30 flex items-center justify-center text-vault-accent font-bold text-xs">
                          {c.display_name.slice(0, 1)}
                        </div>
                        <h4 className="text-sm font-semibold text-vault-100">{c.display_name}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Private
                      </span>
                    </div>

                    <div className="space-y-1 font-mono text-[11px] text-vault-400 bg-vault-950 p-2.5 rounded-xl border border-vault-800">
                      <p>Access Code: <span className="text-vault-accent font-bold">{c.access_code}</span></p>
                      <p className="truncate">Email: {c.email || 'None'}</p>
                      <p className="text-vault-500 text-[10px]">{c.download_count} total downloads</p>
                    </div>
                  </div>

                  {/* 1-Click Upload to THIS Client's Private Folder */}
                  <button
                    onClick={() => {
                      setTargetClientForUpload(c);
                      setActiveTab('upload');
                    }}
                    className="w-full py-2.5 rounded-xl bg-vault-accent/10 hover:bg-vault-accent text-vault-accent hover:text-vault-950 border border-vault-accent/30 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Upload to {c.display_name.split(' ')[0]}'s Folder</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Client Card */}
            <div className="bg-vault-900 border border-vault-800 rounded-3xl p-6 max-w-xl">
              <h4 className="text-xs font-serif uppercase tracking-wider text-vault-100 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-vault-accent" /> Create Another Private Client Folder
              </h4>
              <form onSubmit={handleCreateClient} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Client Full Name (e.g. David Miller)"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 focus:border-vault-accent focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Client Email (Optional)"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 focus:border-vault-accent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-vault-accent hover:bg-vault-accentHover text-vault-950 font-semibold text-xs uppercase tracking-wider transition"
                >
                  Create Client Folder
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD INDIVIDUAL LOOSE PHOTOS */}
        {activeTab === 'upload' && (
          <div className="bg-vault-900 border border-vault-800 rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-vault-800 border border-vault-700 flex items-center justify-center mx-auto mb-3 text-vault-accent">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif text-vault-100">
                {targetClientForUpload 
                  ? `Upload Photos to ${targetClientForUpload.display_name}'s Private Folder` 
                  : `Upload Individual Photos`}
              </h3>
              <p className="text-xs text-vault-400 mt-1 max-w-md mx-auto">
                {targetClientForUpload 
                  ? `Any photos you upload here will be placed strictly into ${targetClientForUpload.display_name}'s private gallery.`
                  : `Select single photos, 5 photos, or loose batches directly from your computer.`}
              </p>
            </div>

            {uploadSuccessMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadIndividualPhotos} className="space-y-5">
              {/* Target Destination Selector */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-vault-400 mb-1.5 font-semibold">
                  Select Private Destination:
                </label>
                <select
                  value={targetClientForUpload ? targetClientForUpload.id : 'all'}
                  onChange={(e) => {
                    const found = clients.find(c => c.id === e.target.value);
                    setTargetClientForUpload(found || null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 font-semibold focus:border-vault-accent focus:outline-none"
                >
                  <option value="all">🌐 Entire Photoshoot Pool (General)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      🔒 {c.display_name}'s Private Folder (Code: {c.access_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* INDIVIDUAL FILE SELECTOR (No folder needed!) */}
              <div className="border-2 border-dashed border-vault-700 hover:border-vault-accent rounded-2xl p-8 text-center bg-vault-950/50 cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  id="individualFileInput"
                  className="hidden"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
                <label htmlFor="individualFileInput" className="cursor-pointer block">
                  <span className="px-5 py-2.5 rounded-xl bg-vault-accent text-vault-950 font-semibold text-xs uppercase tracking-wider inline-block hover:bg-vault-accentHover transition">
                    Browse Individual Photos
                  </span>
                  <p className="text-[11px] text-vault-400 mt-2 font-mono">
                    {selectedFiles && selectedFiles.length > 0 
                      ? `✓ ${selectedFiles.length} photo(s) selected ready to upload` 
                      : `Click to select 1, 5, or multiple loose JPG / PNG images`}
                  </p>
                </label>
              </div>

              {/* Submit Upload Button */}
              <button
                type="submit"
                disabled={uploading || !selectedFiles || selectedFiles.length === 0}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs uppercase tracking-widest transition disabled:opacity-40"
              >
                {uploading ? 'Uploading to Private Vault...' : `Upload Selected Photos Now ➔`}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}