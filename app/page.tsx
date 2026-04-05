'use client';

import Link from 'next/link';
import { useState, useRef, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import AuthButton from '@/components/AuthButton';

export default function Home() {
  const { data: session } = useSession();
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalFileRef = useRef<File | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP)');
      setErrorCode(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setErrorCode(null);
      return;
    }
    setError(null);
    setErrorCode(null);
    originalFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const removeBackground = async () => {
    if (!originalImage || !originalFileRef.current) return;

    // Prompt login if not authenticated
    if (!session?.user) {
      signIn('google');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const formData = new FormData();
      formData.append('image_file', originalFileRef.current);

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorCode(data.code || null);
        throw new Error(data.error || 'Failed to remove background');
      }

      setImage(`data:image/png;base64,${data.result}`);
      if (data.creditsRemaining !== undefined) {
        setCreditsRemaining(data.creditsRemaining);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = 'removed-background.png';
    link.click();
  };

  const reset = () => {
    setImage(null);
    setOriginalImage(null);
    setError(null);
    setErrorCode(null);
    setCreditsRemaining(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1e 40%, #0a0f1e 70%, #0a0a0f 100%)' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute -top-20 right-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }} />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #059669, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', background: 'rgba(10,10,15,0.6)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>✂️</div>
            <span className="text-lg font-bold text-white">RemoveBG</span>
          </div>
          <nav className="flex gap-1 items-center">
            {[
              { href: '/about', label: 'About' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/profile', label: 'Profile' },
              { href: '/privacy', label: 'Privacy' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="px-3 py-1.5 rounded-lg text-sm transition-all" style={{ color: 'rgba(200,200,220,0.7)' }}>
                {label}
              </Link>
            ))}
            <div className="ml-2"><AuthButton /></div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            ✨ AI-Powered Background Removal
          </div>
          <h2 className="text-5xl font-extrabold mb-4 leading-tight">
            <span className="text-white">Remove </span>
            <span className="gradient-text">Any Background</span>
            <br />
            <span className="text-white">Instantly</span>
          </h2>
          <p className="text-lg max-w-md mx-auto" style={{ color: 'rgba(180,180,210,0.75)' }}>
            Upload your image and get a clean, transparent background in seconds — no design skills needed.
          </p>

          {!image && (
            <div className="flex justify-center gap-8 mt-8">
              {[
                { value: '100%', label: 'Accurate' },
                { value: '<5s', label: 'Processing' },
                { value: 'Free', label: 'To Start' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(160,160,190,0.6)' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Credits remaining banner */}
        {creditsRemaining !== null && creditsRemaining <= 3 && (
          <div className="mb-6 p-3 rounded-xl flex items-center justify-between text-sm"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', color: '#fbbf24' }}>
            <span>⚠️ Only {creditsRemaining} HD credit{creditsRemaining !== 1 ? 's' : ''} remaining</span>
            <Link href="/pricing" className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24' }}>
              Buy More →
            </Link>
          </div>
        )}

        {/* Upload / Result area */}
        {!image ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-3xl p-16 text-center transition-all relative overflow-hidden"
            style={{
              border: dragOver ? '2px dashed #7c3aed' : '2px dashed rgba(255,255,255,0.12)',
              background: dragOver ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
              boxShadow: dragOver ? '0 0 40px rgba(124,58,237,0.2)' : 'none',
            }}
          >
            {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map(pos => (
              <div key={pos} className={`absolute ${pos} w-2 h-2 rounded-full`} style={{ background: dragOver ? '#7c3aed' : 'rgba(255,255,255,0.15)' }} />
            ))}
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))', border: '1px solid rgba(124,58,237,0.3)' }}>
                🖼️
              </div>
              <p className="text-xl font-semibold text-white mb-2">Drop your image here</p>
              <p className="text-sm mb-6" style={{ color: 'rgba(160,160,190,0.6)' }}>or click to browse files</p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
                Choose File
              </div>
              <p className="text-xs mt-5" style={{ color: 'rgba(130,130,160,0.5)' }}>Supports JPG, PNG, WebP · Max 10MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="hidden" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-sm font-medium" style={{ color: 'rgba(200,200,220,0.8)' }}>Original</span>
                </div>
                <button onClick={reset} className="text-xs px-3 py-1 rounded-lg transition-all"
                  style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  × Remove
                </button>
              </div>
              <div className="p-4 flex items-center justify-center min-h-64" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <img src={originalImage!} alt="Original" className="max-w-full max-h-72 object-contain rounded-lg" />
              </div>
            </div>

            {/* Result */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-sm font-medium" style={{ color: 'rgba(200,200,220,0.8)' }}>Result</span>
                </div>
                {image !== originalImage && (
                  <button onClick={downloadResult} className="text-xs px-3 py-1 rounded-lg transition-all font-medium"
                    style={{ color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
                    ↓ Download PNG
                  </button>
                )}
              </div>
              <div className="p-4 flex items-center justify-center min-h-64 checkerboard">
                <img src={image!} alt="Result" className="max-w-full max-h-72 object-contain rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {/* Error messages */}
        {error && (
          <div className="mt-6 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="p-4 text-sm text-center" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
              ⚠️ {error}
            </div>
            {errorCode === 'NO_CREDITS' && (
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.1)' }}>
                <span className="text-xs" style={{ color: 'rgba(248,113,113,0.8)' }}>Purchase credits to continue processing images</span>
                <Link href="/pricing" className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff' }}>
                  View Pricing →
                </Link>
              </div>
            )}
            {errorCode === 'AUTH_REQUIRED' && (
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.1)' }}>
                <span className="text-xs" style={{ color: 'rgba(248,113,113,0.8)' }}>Sign in to start removing backgrounds</span>
                <button onClick={() => signIn('google')} className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff' }}>
                  Sign in with Google →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        {image && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={removeBackground}
              disabled={loading || image !== originalImage}
              className="px-10 py-4 rounded-2xl text-base font-semibold text-white transition-all"
              style={{
                background: loading || image !== originalImage
                  ? 'rgba(80,80,100,0.5)'
                  : 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
                boxShadow: loading || image !== originalImage ? 'none' : '0 4px 30px rgba(124,58,237,0.4)',
                cursor: loading || image !== originalImage ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : !session?.user ? (
                '🔐 Sign in to Remove Background'
              ) : (
                '✨ Remove Background'
              )}
            </button>
            <p className="text-xs" style={{ color: 'rgba(130,130,160,0.5)' }}>Powered by Remove.bg API</p>
          </div>
        )}

        {/* Features row */}
        {!image && (
          <div className="grid grid-cols-3 gap-4 mt-12">
            {[
              { icon: '⚡', title: 'Lightning Fast', desc: 'Results in under 5 seconds' },
              { icon: '🎯', title: 'Pixel Perfect', desc: 'Clean edges, every time' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Images not stored' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-sm font-semibold text-white mb-1">{title}</div>
                <div className="text-xs" style={{ color: 'rgba(150,150,180,0.6)' }}>{desc}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 py-6 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm" style={{ color: 'rgba(120,120,150,0.6)' }}>© 2026 RemoveBG. All rights reserved.</span>
          <div className="flex gap-4 text-sm" style={{ color: 'rgba(120,120,150,0.6)' }}>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
