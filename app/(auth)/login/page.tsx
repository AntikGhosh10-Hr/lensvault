'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, KeyRound, Eye, EyeOff, Camera, ArrowRight, ShieldAlert, Sparkles, UserPlus } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : (searchParams.get('role') === 'admin' ? 'admin' : 'client');

  const [tab, setTab] = useState<'client' | 'register' | 'admin'>(defaultTab);
  
  // Client Login State
  const [accessCode, setAccessCode] = useState('');
  const [clientPassword, setClientPassword] = useState('');

  // Self-Registration State (Option A)
  const [regEventCode, setRegEventCode] = useState('OCT2026');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Admin State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Client Existing Login
  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode, password: clientPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      router.push(`/gallery/${data.photoshootId}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Client Self-Registration (Option A)
  const handleSelfRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/client-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventCode: regEventCode,
          displayName: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Instantly open their new private gallery!
      router.push(`/gallery/${data.photoshootId}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Admin credentials rejected');

      router.push('/admin');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-vault-950">
      <Link href="/" className="flex items-center space-x-2.5 mb-8 group">
        <div className="w-8 h-8 rounded-full border border-vault-accent/40 flex items-center justify-center text-vault-accent group-hover:border-vault-accent transition">
          <Camera className="w-4 h-4" />
        </div>
        <span className="text-sm font-serif tracking-widest uppercase text-vault-100 font-semibold">
          LENSVAULT
        </span>
      </Link>

      <div className="w-full max-w-md bg-vault-900 border border-vault-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-vault-accent to-transparent opacity-40" />

        {/* 3 Tabs: Client Sign In / Register (Self) / Photographer Admin */}
        <div className="flex border-b border-vault-800 mb-8 pb-3 gap-1">
          <button
            type="button"
            onClick={() => { setTab('client'); setErrorMessage(''); }}
            className={`flex-1 text-[11px] uppercase tracking-wider pb-2 font-medium transition ${
              tab === 'client' ? 'text-vault-accent border-b-2 border-vault-accent font-bold' : 'text-vault-400 hover:text-vault-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMessage(''); }}
            className={`flex-1 text-[11px] uppercase tracking-wider pb-2 font-medium transition ${
              tab === 'register' ? 'text-vault-accent border-b-2 border-vault-accent font-bold' : 'text-vault-400 hover:text-vault-200'
            }`}
          >
            Claim Gallery
          </button>
          <button
            type="button"
            onClick={() => { setTab('admin'); setErrorMessage(''); }}
            className={`flex-1 text-[11px] uppercase tracking-wider pb-2 font-medium transition ${
              tab === 'admin' ? 'text-vault-accent border-b-2 border-vault-accent font-bold' : 'text-vault-400 hover:text-vault-200'
            }`}
          >
            Studio Admin
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* TAB 1: Existing Client Sign In */}
        {tab === 'client' && (
          <form onSubmit={handleClientLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-1.5">Gallery Access Code</label>
              <input
                type="text"
                required
                placeholder="e.g. EMMA-OCT26"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 text-sm uppercase tracking-wider font-mono focus:border-vault-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-1.5">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={clientPassword}
                onChange={(e) => setClientPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 text-sm focus:border-vault-accent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-vault-accent hover:bg-vault-accentHover text-vault-950 font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Private Gallery'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-vault-500 mt-2">
              First time here? <button type="button" onClick={() => setTab('register')} className="text-vault-accent hover:underline">Claim your gallery with event code</button>
            </p>
          </form>
        )}

        {/* TAB 2: CLIENT SELF-REGISTRATION (Option A) */}
        {tab === 'register' && (
          <form onSubmit={handleSelfRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-1">Photoshoot Event Code</label>
              <input
                type="text"
                required
                placeholder="e.g. OCT2026"
                value={regEventCode}
                onChange={(e) => setRegEventCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 text-xs font-mono uppercase tracking-wider focus:border-vault-accent focus:outline-none"
              />
              <span className="text-[10px] text-vault-500 mt-0.5 block">Provided by your photographer (e.g. OCT2026)</span>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Morgan"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 text-xs focus:border-vault-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-1">Your Email Address</label>
              <input
                type="email"
                placeholder="alex@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 text-xs focus:border-vault-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-1">Create Your Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Choose a password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 text-xs focus:border-vault-accent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-vault-accent hover:bg-vault-accentHover text-vault-950 font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Creating Your Vault...' : 'Create Account & Access Gallery'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: Photographer Admin Sign In */}
        {tab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-1.5">Studio Email</label>
              <input
                type="email"
                required
                placeholder="boss@lensvault.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 text-sm focus:border-vault-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-1.5">Studio Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 text-sm focus:border-vault-accent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-vault-100 hover:bg-white text-vault-950 font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Verifying Admin...' : 'Open Studio Dashboard'}</span>
              <Lock className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-vault-950 flex items-center justify-center text-vault-400 font-mono text-xs">Loading Portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}