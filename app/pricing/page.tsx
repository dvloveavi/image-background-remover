'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function PricingPage() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<'credits' | 'subscription'>('credits');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const creditPackages = [
    { id: 'starter', name: 'Starter', price: 4.99, credits: 10, popular: false, desc: 'Perfect for trying out' },
    { id: 'popular', name: 'Popular', price: 12.99, credits: 30, popular: true, desc: 'Most users love this' },
    { id: 'pro', name: 'Pro Pack', price: 29.99, credits: 80, popular: false, desc: 'For power users' },
  ];

  const subscriptions = [
    { id: 'basic', name: 'Basic', price: 9.99, credits: 25, popular: false, desc: 'Great for regular use' },
    { id: 'pro', name: 'Pro', price: 19.99, credits: 60, popular: true, desc: 'Unlimited creativity' },
  ];

  async function handleBuyCredits(packageId: string) {
    if (!session) { signIn('google'); return; }
    setLoadingId(packageId);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.approveUrl) window.location.href = data.approveUrl;
      else alert(data.error || 'Failed to start payment');
    } catch {
      alert('Network error, please try again.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSubscribe(planKey: string) {
    if (!session) { signIn('google'); return; }
    setLoadingId(`sub_${planKey}`);
    try {
      const res = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (data.approveUrl) window.location.href = data.approveUrl;
      else alert(data.error || 'Failed to start subscription');
    } catch {
      alert('Network error, please try again.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1e 40%, #0a0f1e 70%, #0a0a0f 100%)' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute bottom-40 right-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', background: 'rgba(10,10,15,0.6)' }}>
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm transition-colors" style={{ color: 'rgba(160,160,190,0.7)' }}>
            <span>←</span> Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Hero text */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            💎 Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Choose Your Plan</h1>
          <p className="text-lg" style={{ color: 'rgba(160,160,190,0.7)' }}>
            Start free, scale as you grow
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="p-1 rounded-xl inline-flex" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['credits', 'subscription'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: mode === tab ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
                  color: mode === tab ? '#fff' : 'rgba(160,160,190,0.6)',
                  boxShadow: mode === tab ? '0 2px 12px rgba(124,58,237,0.4)' : 'none',
                }}
              >
                {tab === 'credits' ? '🪙 Credit Packages' : '🔄 Monthly Plans'}
              </button>
            ))}
          </div>
        </div>

        {/* Credit Packages */}
        {mode === 'credits' && (
          <div className="grid md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-6 flex flex-col transition-all ${pkg.popular ? 'mt-4' : ''}`}
                style={{
                  background: pkg.popular
                    ? 'linear-gradient(160deg, rgba(124,58,237,0.12), rgba(37,99,235,0.08))'
                    : 'rgba(255,255,255,0.03)',
                  border: pkg.popular
                    ? '1px solid rgba(124,58,237,0.4)'
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: pkg.popular ? '0 0 40px rgba(124,58,237,0.15)' : 'none',
                }}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', boxShadow: '0 2px 12px rgba(124,58,237,0.5)' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-sm" style={{ color: 'rgba(150,150,180,0.6)' }}>{pkg.desc}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">${pkg.price}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium"
                    style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    {pkg.credits} credits
                  </div>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {['Never expires', 'HD quality output', 'Commercial use', 'Instant delivery'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(200,200,220,0.8)' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBuyCredits(pkg.id)}
                  disabled={loadingId === pkg.id}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: pkg.popular
                      ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                      : 'rgba(255,255,255,0.07)',
                    color: '#fff',
                    border: pkg.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: pkg.popular ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                    opacity: loadingId === pkg.id ? 0.6 : 1,
                    cursor: loadingId === pkg.id ? 'wait' : 'pointer',
                  }}
                >
                  {loadingId === pkg.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Redirecting...
                    </>
                  ) : (
                    <> <span>Buy with PayPal</span> </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Subscriptions */}
        {mode === 'subscription' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="relative rounded-2xl p-7 flex flex-col transition-all"
                style={{
                  background: sub.popular
                    ? 'linear-gradient(160deg, rgba(124,58,237,0.12), rgba(37,99,235,0.08))'
                    : 'rgba(255,255,255,0.03)',
                  border: sub.popular
                    ? '1px solid rgba(124,58,237,0.4)'
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: sub.popular ? '0 0 40px rgba(124,58,237,0.15)' : 'none',
                }}
              >
                {sub.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', boxShadow: '0 2px 12px rgba(124,58,237,0.5)' }}>
                    ✨ BEST VALUE
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white mb-1">{sub.name}</h3>
                  <p className="text-sm" style={{ color: 'rgba(150,150,180,0.6)' }}>{sub.desc}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-white">${sub.price}</span>
                    <span className="mb-1 text-sm" style={{ color: 'rgba(150,150,180,0.7)' }}>/month</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium"
                    style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    {sub.credits} credits/month
                  </div>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {['Monthly credits auto-renewed', 'HD quality output', 'Commercial use', 'Cancel anytime'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(200,200,220,0.8)' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(sub.id)}
                  disabled={loadingId === `sub_${sub.id}`}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: sub.popular
                      ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                      : 'rgba(255,255,255,0.07)',
                    color: '#fff',
                    border: sub.popular ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: sub.popular ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                    opacity: loadingId === `sub_${sub.id}` ? 0.6 : 1,
                    cursor: loadingId === `sub_${sub.id}` ? 'wait' : 'pointer',
                  }}
                >
                  {loadingId === `sub_${sub.id}` ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Redirecting...
                    </>
                  ) : (
                    'Subscribe with PayPal'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sandbox notice */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 text-center text-xs max-w-sm mx-auto py-2.5 px-4 rounded-xl"
            style={{ color: 'rgba(234,179,8,0.7)', background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}>
            🧪 Sandbox mode — use PayPal test accounts
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-14">
          <p className="text-sm mb-3" style={{ color: 'rgba(150,150,180,0.6)' }}>Not ready to commit?</p>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: '#a78bfa' }}>
            Try it free first →
          </Link>
        </div>
      </main>
    </div>
  );
}
