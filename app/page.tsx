import Link from 'next/link';
import { Camera, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-vault-800/60 bg-vault-950/80 backdrop-blur-md px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full border border-vault-accent/40 flex items-center justify-center text-vault-accent">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-sm font-serif tracking-widest uppercase text-vault-100 font-semibold">
            LENSVAULT <span className="text-[10px] text-vault-accent font-sans ml-1 font-normal tracking-normal">STUDIOS</span>
          </span>
        </div>

        <Link
          href="/login"
          className="text-xs uppercase tracking-widest text-vault-400 hover:text-vault-100 transition py-1 px-3 border border-vault-700/60 rounded-full hover:border-vault-accent"
        >
          Client Portal
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center justify-center">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-vault-700/50 bg-vault-900/60 text-vault-400 text-xs tracking-wider uppercase mb-8">
          <Lock className="w-3.5 h-3.5 text-vault-accent" />
          <span>Private Encrypted Client Vaults</span>
        </div>

        {/* Master Heading as requested */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-vault-50 tracking-tight max-w-4xl leading-[1.15] mb-6">
          Your Memories, <br />
          <span className="italic font-light text-vault-accent">Beautifully Preserved.</span>
        </h1>

        <p className="text-base md:text-lg text-vault-400 max-w-2xl font-light leading-relaxed mb-10">
          Enter your private photoshoot gallery. Our neural curation automatically discovers and organizes your portraits for seamless preview and full-resolution archival download.
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login"
            className="px-8 py-4 rounded-full bg-vault-accent hover:bg-vault-accentHover text-vault-950 font-medium text-sm tracking-wider uppercase flex items-center gap-3 transition shadow-lg shadow-vault-accent/10 transform active:scale-95"
          >
            <span>Access My Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Photography Showcase Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl">
          <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-vault-800 bg-vault-900">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
              alt="Editorial Portrait"
              className="w-full h-full object-cover gallery-img filter brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 text-left">
              <span className="text-[10px] uppercase tracking-widest text-vault-accent font-mono">Series A</span>
              <h3 className="text-sm font-serif text-vault-100">Editorial Studio Session</h3>
            </div>
          </div>

          <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-vault-800 bg-vault-900 md:-translate-y-4">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
              alt="Natural Light Portrait"
              className="w-full h-full object-cover gallery-img filter brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 text-left">
              <span className="text-[10px] uppercase tracking-widest text-vault-accent font-mono">Series B</span>
              <h3 className="text-sm font-serif text-vault-100">Graduate Class of 2026</h3>
            </div>
          </div>

          <div className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-vault-800 bg-vault-900">
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
              alt="Golden Hour Session"
              className="w-full h-full object-cover gallery-img filter brightness-90 contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 text-left">
              <span className="text-[10px] uppercase tracking-widest text-vault-accent font-mono">Series C</span>
              <h3 className="text-sm font-serif text-vault-100">Sunset Architectural Series</h3>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Discreet Photographer Login */}
      <footer className="border-t border-vault-800/40 px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-vault-400 max-w-6xl mx-auto w-full">
        <p>© 2026 LensVault Studios. Curated exclusively for registered clients.</p>
        <div className="flex items-center space-x-6 mt-4 sm:mt-0">
          <span className="flex items-center gap-1.5 text-vault-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> End-to-End Privacy
          </span>
          <Link
            href="/login?role=admin"
            className="hover:text-vault-100 transition text-[11px] font-mono tracking-wider text-vault-400 hover:text-vault-accent"
          >
            [ Photographer Sign In ]
          </Link>
        </div>
      </footer>
    </div>
  );
}
