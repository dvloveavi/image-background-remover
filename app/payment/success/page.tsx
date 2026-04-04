'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const token = searchParams.get('token');
  const subscriptionId = searchParams.get('subscription_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    async function confirm() {
      try {
        if (type === 'credits' && token) {
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: token }),
          });
          const data = await res.json();
          if (data.success) {
            setStatus('success');
            setCredits(data.credits);
            setMessage(`${data.credits} HD credits have been added to your account.`);
          } else {
            setStatus('error');
            setMessage(data.error || 'Payment capture failed.');
          }
        } else if (type === 'subscription' && subscriptionId) {
          setStatus('success');
          setMessage('Your subscription is now active. Credits will be added to your account shortly via webhook.');
        } else {
          setStatus('error');
          setMessage('Missing payment information. Please contact support if you were charged.');
        }
      } catch {
        setStatus('error');
        setMessage('A network error occurred. Please contact support if you were charged.');
      }
    }
    confirm();
  }, [type, token, subscriptionId]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1e 40%, #0a0f1e 70%, #0a0a0f 100%)' }}>

      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      </div>

      <div className="relative z-10 rounded-3xl p-10 max-w-md w-full text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24" fill="none" style={{ color: '#a78bfa' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Confirming Payment</h1>
            <p className="text-sm" style={{ color: 'rgba(160,160,190,0.6)' }}>Please wait, this will only take a moment…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
              ✅
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Payment Confirmed!</h1>

            {credits !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-4"
                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                +{credits} HD Credits Added
              </div>
            )}

            <p className="text-sm mb-8" style={{ color: 'rgba(160,160,190,0.7)' }}>{message}</p>

            <div className="flex flex-col gap-3">
              <Link href="/" className="w-full py-3 rounded-xl text-sm font-semibold text-center transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
                Start Removing Backgrounds ✨
              </Link>
              <Link href="/profile" className="w-full py-3 rounded-xl text-sm font-medium text-center transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(180,180,210,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                View My Account
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              ❌
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
            <p className="text-sm mb-8" style={{ color: 'rgba(160,160,190,0.7)' }}>{message}</p>
            <div className="flex flex-col gap-3">
              <Link href="/pricing" className="w-full py-3 rounded-xl text-sm font-semibold text-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff' }}>
                Back to Pricing
              </Link>
              <Link href="/" className="w-full py-3 rounded-xl text-sm font-medium text-center"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(180,180,210,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Go Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0f' }}>
        <div className="text-sm" style={{ color: 'rgba(160,160,190,0.5)' }}>Loading...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
