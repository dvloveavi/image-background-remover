'use client';

import { useState } from 'react';

export default function PricingPage() {
  const [mode, setMode] = useState<'credits' | 'subscription'>('credits');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const creditPackages = [
    { id: 'starter', name: 'Starter', price: 4.99, credits: 10, popular: false },
    { id: 'popular', name: 'Popular', price: 12.99, credits: 30, popular: true },
    { id: 'pro', name: 'Pro Pack', price: 29.99, credits: 80, popular: false },
  ];

  const subscriptions = [
    { id: 'basic', name: 'Basic', price: 9.99, credits: 25, popular: false },
    { id: 'pro', name: 'Pro', price: 19.99, credits: 60, popular: true },
  ];

  async function handleBuyCredits(packageId: string) {
    setLoadingId(packageId);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      } else {
        alert(data.error || 'Failed to start payment');
      }
    } catch {
      alert('Network error, please try again.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleSubscribe(planKey: string) {
    setLoadingId(`sub_${planKey}`);
    try {
      const res = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (data.approveUrl) {
        window.location.href = data.approveUrl;
      } else {
        alert(data.error || 'Failed to start subscription');
      }
    } catch {
      alert('Network error, please try again.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="py-6 px-4 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto">
          <a href="/" className="text-slate-400 hover:text-white">← Back to Home</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Pricing Plans</h1>
          <p className="text-slate-400">Choose the plan that fits your needs</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-800/50 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setMode('credits')}
              className={`px-6 py-2 rounded-md transition ${
                mode === 'credits' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              Credit Packages
            </button>
            <button
              onClick={() => setMode('subscription')}
              className={`px-6 py-2 rounded-md transition ${
                mode === 'subscription' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              Monthly Subscription
            </button>
          </div>
        </div>

        {/* Credit Packages */}
        {mode === 'credits' && (
          <div className="grid md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`bg-slate-800/50 rounded-xl p-6 border ${
                  pkg.popular ? 'border-blue-500' : 'border-slate-700/50'
                } relative`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">${pkg.price}</span>
                </div>
                <p className="text-slate-400 mb-6">{pkg.credits} credits</p>
                <ul className="space-y-2 mb-6 text-sm text-slate-300">
                  <li>✓ Never expires</li>
                  <li>✓ HD quality output</li>
                  <li>✓ Commercial use</li>
                </ul>
                <button
                  onClick={() => handleBuyCredits(pkg.id)}
                  disabled={loadingId === pkg.id}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-wait text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  {loadingId === pkg.id ? (
                    <>
                      <span className="animate-spin">⏳</span> Redirecting...
                    </>
                  ) : (
                    <>
                      <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Subscriptions */}
        {mode === 'subscription' && (
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {subscriptions.map((sub) => (
              <div
                key={sub.name}
                className={`bg-slate-800/50 rounded-xl p-6 border ${
                  sub.popular ? 'border-blue-500' : 'border-slate-700/50'
                } relative`}
              >
                {sub.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    Best Value
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{sub.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">${sub.price}</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-slate-400 mb-6">{sub.credits} credits per month</p>
                <ul className="space-y-2 mb-6 text-sm text-slate-300">
                  <li>✓ Monthly credits auto-renewed</li>
                  <li>✓ HD quality output</li>
                  <li>✓ Commercial use</li>
                  <li>✓ Cancel anytime</li>
                </ul>
                <button
                  onClick={() => handleSubscribe(sub.id)}
                  disabled={loadingId === `sub_${sub.id}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-wait text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                >
                  {loadingId === `sub_${sub.id}` ? (
                    <>
                      <span className="animate-spin">⏳</span> Redirecting...
                    </>
                  ) : (
                    <>
                      <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="h-4 w-4" />
                      Subscribe Now
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sandbox notice */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 text-center text-xs text-yellow-500/70 bg-yellow-900/20 border border-yellow-800/30 rounded-lg py-2 px-4 max-w-sm mx-auto">
            🧪 Sandbox mode — use PayPal sandbox accounts to test
          </div>
        )}

        <div className="text-center mt-12">
          <a href="/" className="text-blue-400 hover:text-blue-300">
            Try for Free →
          </a>
        </div>
      </main>
    </div>
  );
}
