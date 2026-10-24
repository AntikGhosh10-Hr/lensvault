'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, Download, Heart, LogOut, ChevronLeft, ChevronRight, 
  X, ShieldCheck, FolderArchive, Sparkles, AlertCircle 
} from 'lucide-react';

interface PhotoItem {
  id: string;
  assignmentId: string;
  fileName: string;
  previewUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileSize: number;
  isGroupPhoto: boolean;
  isFavorite: boolean;
  matchConfidence: number;
}

export default function ClientGalleryPage({ params }: { params: { photoshootId: string } }) {
  const router = useRouter();
  const [photoshoot, setPhotoshoot] = useState<any>(null);
  const [clientName, setClientName] = useState<string>('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    fetchGalleryData();
  }, [params.photoshootId]);

  const fetchGalleryData = async () => {
    try {
      const res = await fetch('/api/gallery/photos');
      if (res.status === 401 || res.status === 403) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load gallery');

      setPhotoshoot(data.photoshoot);
      setClientName(data.clientName);
      setPhotos(data.photos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (photoId: string, currentFav: boolean) => {
    try {
      setPhotos(prev =>
        prev.map(p => (p.id === photoId ? { ...p, isFavorite: !currentFav } : p))
      );

      await fetch('/api/gallery/photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, isFavorite: !currentFav }),
      });
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const res = await fetch('/api/gallery/download-zip');
      if (!res.ok) throw new Error('ZIP generation failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName.replace(/\s+/g, '_')}_Gallery.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Could not download archive: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const displayedPhotos = filterFavorites
    ? photos.filter(p => p.isFavorite)
    : photos;

  if (loading) {
    return (
      <div className="min-h-screen bg-vault-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-vault-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-vault-400 font-mono">
          Verifying Private Encryption & Loading Portraits...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-vault-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
        <h2 className="text-xl font-serif text-vault-100 mb-2">Gallery Access Error</h2>
        <p className="text-sm text-vault-400 max-w-md mb-6">{error}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 rounded-full bg-vault-800 border border-vault-700 text-xs uppercase tracking-wider text-vault-200 hover:text-white"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-950 flex flex-col">
      
      {/* Top Header */}
      <header className="border-b border-vault-800/80 bg-vault-950/90 backdrop-blur-md sticky top-0 z-30 px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-vault-accent/40 flex items-center justify-center text-vault-accent">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-serif tracking-widest uppercase text-vault-200">
              LENSVAULT PRIVATE
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3 h-3" /> Encrypted Session
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition ${
              filterFavorites
                ? 'border-rose-500/60 bg-rose-500/10 text-rose-400'
                : 'border-vault-700 bg-vault-900 text-vault-400 hover:text-vault-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-rose-400' : ''}`} />
            <span className="hidden sm:inline">Favorites</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping || photos.length === 0}
            className="px-4 py-1.5 rounded-full bg-vault-accent hover:bg-vault-accentHover text-vault-950 text-xs font-medium tracking-wider uppercase flex items-center gap-2 shadow-md shadow-vault-accent/10 transition disabled:opacity-50"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Archiving...' : 'Download All (ZIP)'}</span>
          </button>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-full border border-vault-800 hover:border-vault-700 text-vault-400 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Editorial Title Banner */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8 w-full">
        <span className="text-xs font-mono uppercase tracking-widest text-vault-accent">
          Private Client Gallery
        </span>
        <h1 className="text-3xl md:text-5xl font-serif text-vault-50 tracking-tight mt-1 mb-2">
          Welcome, {clientName}
        </h1>
        <p className="text-sm text-vault-400 font-light flex items-center gap-2 flex-wrap">
          <span>{photoshoot?.title}</span>
          <span>•</span>
          <span>{photoshoot?.session_date}</span>
          <span>•</span>
          <span className="text-vault-200 font-medium">{photos.length} Photographs Available</span>
        </p>
      </section>

      {/* Main Gallery Grid */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24 w-full flex-1">
        {displayedPhotos.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-vault-800 rounded-3xl">
            <p className="text-vault-500 font-serif text-lg mb-1">No photographs to display</p>
            <p className="text-xs text-vault-600 font-mono">
              {filterFavorites ? 'You have not marked any favorites yet.' : 'Your curated gallery is currently empty.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-[3/4] bg-vault-900 border border-vault-800/80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:border-vault-accent/50 transition duration-300"
                onClick={() => setActivePhotoIndex(index)}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.fileName}
                  className="w-full h-full object-cover gallery-img"
                  loading="lazy"
                />

                {/* Gradient Shadow Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-vault-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-between p-4" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  {photo.isGroupPhoto ? (
                    <span className="px-2 py-0.5 rounded-full bg-vault-950/80 backdrop-blur-md border border-vault-700 text-[10px] text-vault-300 font-mono">
                      Group Photo
                    </span>
                  ) : <span />}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(photo.id, photo.isFavorite);
                    }}
                    className="p-1.5 rounded-full bg-vault-950/70 backdrop-blur-md border border-vault-700/60 hover:scale-110 transition pointer-events-auto"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        photo.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-vault-300'
                      }`}
                    />
                  </button>
                </div>

                {/* Bottom Details on Hover */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition duration-200">
                  <span className="text-[11px] text-vault-300 font-mono truncate max-w-[150px]">
                    {photo.fileName}
                  </span>
                  <a
                    href={photo.previewUrl}
                    download={photo.fileName}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-vault-800/90 hover:bg-vault-accent hover:text-vault-950 text-vault-200 transition"
                    title="Download Full Resolution"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {activePhotoIndex !== null && displayedPhotos[activePhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8">
          
          {/* Close Button */}
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-vault-900/80 border border-vault-700 text-vault-400 hover:text-white transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Previous */}
          {activePhotoIndex > 0 && (
            <button
              onClick={() => setActivePhotoIndex(activePhotoIndex - 1)}
              className="absolute left-6 p-3 rounded-full bg-vault-900/80 border border-vault-700 text-vault-300 hover:text-white transition hidden md:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Active Image Container */}
          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center relative">
            <img
              src={displayedPhotos[activePhotoIndex].previewUrl}
              alt={displayedPhotos[activePhotoIndex].fileName}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
            />

            {/* Lightbox Footer Bar */}
            <div className="w-full mt-4 flex items-center justify-between text-xs text-vault-400 px-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-vault-200">
                  {displayedPhotos[activePhotoIndex].fileName}
                </span>
                <span>•</span>
                <span>Photo {activePhotoIndex + 1} of {displayedPhotos.length}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    handleToggleFavorite(
                      displayedPhotos[activePhotoIndex].id,
                      displayedPhotos[activePhotoIndex].isFavorite
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-vault-700 hover:border-rose-500/50 text-vault-300 hover:text-rose-400 transition"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      displayedPhotos[activePhotoIndex].isFavorite ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span>{displayedPhotos[activePhotoIndex].isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>

                <a
                  href={displayedPhotos[activePhotoIndex].previewUrl}
                  download={displayedPhotos[activePhotoIndex].fileName}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-vault-accent hover:bg-vault-accentHover text-vault-950 font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Resolution</span>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Next */}
          {activePhotoIndex < displayedPhotos.length - 1 && (
            <button
              onClick={() => setActivePhotoIndex(activePhotoIndex + 1)}
              className="absolute right-6 p-3 rounded-full bg-vault-900/80 border border-vault-700 text-vault-300 hover:text-white transition hidden md:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
