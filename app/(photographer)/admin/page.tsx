'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, Plus, Users, Image as ImageIcon, CheckCircle, 
  Clock, Shield, UploadCloud, Eye, Check, X, ArrowRight,
  FolderArchive, Sparkles, ExternalLink, RefreshCw, KeyRound
} from 'lucide-react';

export default function PhotographerAdminDashboard() {
  const router = useRouter();
  
  // Dashboard State
  const [photoshoots, setPhotoshoots] = useState<any[]>([]);
  const [selectedPhotoshoot, setSelectedPhotoshoot] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [reviewAssignments, setReviewAssignments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'photoshoots' | 'clients' | 'upload' | 'review'>('photoshoots');
  const [loading, setLoading] = useState(true);

  // Forms
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-10-25');
  const [newLocation, setNewLocation] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPass, setNewClientPass] = useState('Memory2026!');
  const [uploadStatus, setUploadStatus] = useState('');

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

  const handleCreatePhotoshoot = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/photoshoots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        session_date: newDate,
        location: newLocation,
      }),
    });
    if (res.ok) {
      setNewTitle('');
      fetchPhotoshoots();
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

  const handleReviewAction = async (assignmentId: string, action: 'approve' | 'reject') => {
    if (!selectedPhotoshoot) return;
    await fetch(`/api/photoshoots/${selectedPhotoshoot.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, action }),
    });
    fetchReviewQueue(selectedPhotoshoot.id);
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

  const totalClients = photoshoots.reduce((acc, p) => acc + (p.client_count || 0), 0);
  const totalPhotos = photoshoots.reduce((acc, p) => acc + (p.photo_count || 0), 0);
  const publishedCount = photoshoots.filter(p => p.is_published).length;

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
            <p className="text-[11px] text-vault-400">Photographer Command Center for Boss</p>
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

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-vault-900 border border-vault-800 p-5 rounded-2xl">
            <span className="text-xs text-vault-400 uppercase tracking-wider font-mono">Photoshoots</span>
            <div className="text-3xl font-serif text-vault-100 mt-1">{photoshoots.length}</div>
          </div>
          <div className="bg-vault-900 border border-vault-800 p-5 rounded-2xl">
            <span className="text-xs text-vault-400 uppercase tracking-wider font-mono">Total Clients</span>
            <div className="text-3xl font-serif text-vault-accent mt-1">{totalClients}</div>
          </div>
          <div className="bg-vault-900 border border-vault-800 p-5 rounded-2xl">
            <span className="text-xs text-vault-400 uppercase tracking-wider font-mono">Total Photos</span>
            <div className="text-3xl font-serif text-vault-200 mt-1">{totalPhotos}</div>
          </div>
          <div className="bg-vault-900 border border-vault-800 p-5 rounded-2xl">
            <span className="text-xs text-vault-400 uppercase tracking-wider font-mono">Live Galleries</span>
            <div className="text-3xl font-serif text-emerald-400 mt-1">{publishedCount}</div>
          </div>
        </div>

        {/* Selected Photoshoot Header */}
        {selectedPhotoshoot && (
          <div className="bg-vault-900/60 border border-vault-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                  selectedPhotoshoot.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {selectedPhotoshoot.is_published ? 'Published & Accessible' : 'Draft / Private'}
                </span>
                <span className="text-xs text-vault-400 font-mono">{selectedPhotoshoot.session_date}</span>
              </div>
              <h2 className="text-2xl font-serif text-vault-50">{selectedPhotoshoot.title}</h2>
              <p className="text-xs text-vault-400 mt-0.5">{selectedPhotoshoot.location || 'Studio Location'}</p>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center space-x-2 bg-vault-950 p-1 rounded-2xl border border-vault-800">
              <button
                onClick={() => setActiveTab('photoshoots')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'photoshoots' ? 'bg-vault-800 text-vault-100' : 'text-vault-400 hover:text-vault-200'
                }`}
              >
                Photoshoots
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'clients' ? 'bg-vault-800 text-vault-100' : 'text-vault-400 hover:text-vault-200'
                }`}
              >
                Clients ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'upload' ? 'bg-vault-800 text-vault-100' : 'text-vault-400 hover:text-vault-200'
                }`}
              >
                Upload & AI Sort
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'review' ? 'bg-vault-accent text-vault-950 font-bold' : 'text-vault-400 hover:text-vault-200'
                }`}
              >
                Review Matches ({reviewAssignments.length})
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Photoshoots List & Creation */}
        {activeTab === 'photoshoots' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-serif uppercase tracking-wider text-vault-400">All Photoshoots</h3>
              <div className="space-y-3">
                {photoshoots.map(ps => (
                  <div
                    key={ps.id}
                    onClick={() => {
                      setSelectedPhotoshoot(ps);
                      fetchClients(ps.id);
                      fetchReviewQueue(ps.id);
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedPhotoshoot?.id === ps.id
                        ? 'border-vault-accent bg-vault-900/90 shadow-md'
                        : 'border-vault-800 bg-vault-900/40 hover:border-vault-700'
                    }`}
                  >
                    <div>
                      <h4 className="text-base font-serif text-vault-100">{ps.title}</h4>
                      <p className="text-xs text-vault-400 font-mono mt-1">
                        {ps.session_date} • {ps.client_count || 0} Clients • {ps.photo_count || 0} Photos
                      </p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-mono ${
                      ps.is_published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-vault-800 text-vault-400'
                    }`}>
                      {ps.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Photoshoot Card */}
            <div className="bg-vault-900 border border-vault-800 rounded-3xl p-6 h-fit">
              <h3 className="text-sm font-serif uppercase tracking-wider text-vault-100 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-vault-accent" /> New Photoshoot
              </h3>
              <form onSubmit={handleCreatePhotoshoot} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-vault-400 block mb-1">Session Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. College Portrait Session"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 focus:border-vault-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-vault-400 block mb-1">Session Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 focus:border-vault-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-vault-400 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="The Quad & Library"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 focus:border-vault-accent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-vault-accent hover:bg-vault-accentHover text-vault-950 font-semibold text-xs uppercase tracking-wider transition"
                >
                  Create Photoshoot
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Client Management (Client A, B, C, D, E) */}
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif uppercase tracking-wider text-vault-400">
                  Registered Clients for {selectedPhotoshoot?.title}
                </h3>
                <span className="text-xs text-vault-accent font-mono">{clients.length} Profiles</span>
              </div>

              <div className="space-y-3">
                {clients.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-vault-800 bg-vault-900/60 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-vault-100">{c.display_name}</h4>
                      <div className="flex items-center gap-3 text-xs text-vault-400 font-mono mt-1">
                        <span className="text-vault-accent bg-vault-accent/10 px-2 py-0.5 rounded border border-vault-accent/30">
                          Code: {c.access_code}
                        </span>
                        <span>{c.email || 'No email attached'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-vault-500 font-mono">
                        {c.download_count} Downloads
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Client Profile Card */}
            <div className="bg-vault-900 border border-vault-800 rounded-3xl p-6 h-fit">
              <h3 className="text-sm font-serif uppercase tracking-wider text-vault-100 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-vault-accent" /> Add Client Profile
              </h3>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-vault-400 block mb-1">Client Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emma Vance"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 focus:border-vault-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-vault-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 focus:border-vault-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-vault-400 block mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={newClientPass}
                    onChange={(e) => setNewClientPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-xs text-vault-100 font-mono focus:border-vault-accent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-vault-accent hover:bg-vault-accentHover text-vault-950 font-semibold text-xs uppercase tracking-wider transition"
                >
                  Generate Client Credentials
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Upload Photos & Trigger AI Pipeline */}
        {activeTab === 'upload' && (
          <div className="bg-vault-900 border border-vault-800 rounded-3xl p-8 max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-3xl bg-vault-800 border border-vault-700 flex items-center justify-center mx-auto mb-4 text-vault-accent shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif text-vault-100 mb-2">Batch Upload Photographs</h3>
            <p className="text-xs text-vault-400 max-w-md mx-auto mb-6">
              Drop 50+ RAW/JPG photographs from this session. The computer vision engine will detect faces, extract 512D embeddings, and prepare candidate matches for review.
            </p>

            <div className="border-2 border-dashed border-vault-700 hover:border-vault-accent rounded-2xl p-10 cursor-pointer transition bg-vault-950/40">
              <input type="file" multiple accept="image/*" className="hidden" id="adminPhotoUpload" />
              <label htmlFor="adminPhotoUpload" className="cursor-pointer">
                <span className="px-5 py-2.5 rounded-xl bg-vault-accent text-vault-950 font-medium text-xs uppercase tracking-wider inline-block">
                  Select Photoshoot Folder
                </span>
                <p className="text-[11px] text-vault-500 mt-3 font-mono">Supports JPG, PNG, WebP, HEIC (Max 50MB per image)</p>
              </label>
            </div>
          </div>
        )}

        {/* Tab 4: Photographer Face-Matching Review Queue */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif uppercase tracking-wider text-vault-100">
                  Candidate Face Match Queue
                </h3>
                <p className="text-xs text-vault-400">
                  Review proposed client assignments before publishing. You have full approval control.
                </p>
              </div>

              <button
                onClick={() => fetchReviewQueue(selectedPhotoshoot.id)}
                className="px-3 py-1.5 rounded-lg border border-vault-800 text-xs text-vault-300 hover:text-white flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {reviewAssignments.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-vault-800 rounded-3xl text-vault-500 font-mono text-xs">
                All detected faces have been reviewed or no photos are awaiting assignment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviewAssignments.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-vault-800 bg-vault-900/80 flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-14 h-14 rounded-xl bg-vault-950 border border-vault-700 overflow-hidden shrink-0">
                        {item.detected_faces?.face_crop_storage_path ? (
                          <img src={item.detected_faces.face_crop_storage_path} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-vault-500 font-mono text-[9px]">
                            FACE
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-vault-100 truncate">
                            {item.clients?.display_name || 'Suggested Match'}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            {Math.round(item.match_confidence * 100)}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-vault-400 font-mono mt-1 truncate">
                          {item.photographs?.file_name}
                        </p>
                        {item.photographs?.is_group_photo && (
                          <span className="text-[9px] uppercase tracking-wider text-vault-accent font-mono block mt-0.5">
                            ★ Group Photo Candidate
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center space-x-2 pt-2 border-t border-vault-800">
                      <button
                        onClick={() => handleReviewAction(item.id, 'approve')}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs flex items-center justify-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReviewAction(item.id, 'reject')}
                        className="p-1.5 rounded-lg border border-vault-700 hover:border-rose-500/60 text-vault-400 hover:text-rose-400 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
