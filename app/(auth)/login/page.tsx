'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, KeyRound, Eye, EyeOff, Camera, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('role') === 'admin' ? 'admin' : 'client';

  const [tab, setTab] = useState<'client' | 'admin'>(defaultTab);
  const [accessCode, setAccessCode] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Route directly into authenticated gallery
      router.push(`/gallery/${data.photoshootId}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      if (!res.ok) {
        throw new Error(data.error || 'Admin credentials rejected');
      }

      router.push('/admin');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-vault-950">
      
      {/* Brand Header */}
      <Link href="/" className="flex items-center space-x-2.5 mb-8 group">
        <div className="w-8 h-8 rounded-full border border-vault-accent/40 flex items-center justify-center text-vault-accent group-hover:border-vault-accent transition">
          <Camera className="w-4 h-4" />
        </div>
        <span className="text-sm font-serif tracking-widest uppercase text-vault-100 font-semibold">
          LENSVAULT
        </span>
      </Link>

      <div className="w-full max-w-md bg-vault-900 border border-vault-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-vault-accent to-transparent opacity-40" />

        {/* Tab Switcher */}
        <div className="flex border-b border-vault-800 mb-8 pb-3">
          <button
            type="button"
            onClick={() => { setTab('client'); setErrorMessage(''); }}
            className={`flex-1 text-xs uppercase tracking-wider pb-2 font-medium transition ${
              tab === 'client'
                ? 'text-vault-accent border-b-2 border-vault-accent'
                : 'text-vault-400 hover:text-vault-200'
            }`}
          >
            Client Access
          </button>
          <button
            type="button"
            onClick={() => { setTab('admin'); setErrorMessage(''); }}
            className={`flex-1 text-xs uppercase tracking-wider pb-2 font-medium transition ${
              tab === 'admin'
                ? 'text-vault-accent border-b-2 border-vault-accent'
                : 'text-vault-400 hover:text-vault-200'
            }`}
          >
            Photographer Admin
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Client Access Form */}
        {tab === 'client' ? (
          <form onSubmit={handleClientLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-2">
                Gallery Access Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. EMMA-OCT26"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 placeholder-vault-600 focus:border-vault-accent focus:outline-none text-sm uppercase tracking-wider font-mono transition"
                />
                <KeyRound className="w-4 h-4 text-vault-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-2">
                Personal Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 placeholder-vault-600 focus:border-vault-accent focus:outline-none text-sm transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-vault-500 hover:text-vault-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-xl bg-vault-accent hover:bg-vault-accentHover text-vault-950 font-medium text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Vault...' : 'Enter Private Gallery'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-4 border-t border-vault-800 text-center">
              <p className="text-[11px] text-vault-500">
                Can't find your access code or password? Please reach out to your photographer for credential recovery.
              </p>
            </div>
          </form>
        ) : (
          /* Photographer Admin Form */
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-2">
                Studio Email
              </label>
              <input
                type="email"
                required
                placeholder="boss@lensvault.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 placeholder-vault-600 focus:border-vault-accent focus:outline-none text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-vault-400 mb-2">
                Studio Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-vault-950 border border-vault-700 text-vault-100 placeholder-vault-600 focus:border-vault-accent focus:outline-none text-sm transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-vault-500 hover:text-vault-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-xl bg-vault-100 hover:bg-white text-vault-950 font-medium text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition disabled:opacity-50"
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
