'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'credits' | 'subscription'
  const token = searchParams.get('token'); // PayPal order token
  const subscriptionId = searchParams.get('subscription_id'); // PayPal subscription ID
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function confirm() {
      try {
        if (type === 'credits' && token) {
          // Capture the one-time order
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: token }),
          });
          const data = await res.json();
          if (data.success) {
            setStatus('success');
            setMessage(`🎉 Payment successful! ${data.credits} credits added to your account.`);
          } else {
            setStatus('error');
            setMessage(data.error || 'Payment capture failed.');
          }
        } else if (type === 'subscription' && subscriptionId) {
          // Subscription is handled via webhook; just show success
          setStatus('success');
          setMessage('🎉 Subscription activated! Credits will be added shortly.');
        } else {
          setStatus('error');
          setMessage('Missing payment information.');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred. Please contact support.');
      }
    }

    confirm();
  }, [type, token, subscriptionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-10 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-300">Confirming your payment...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-3">Payment Confirmed</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-medium"
            >
              Start Removing Backgrounds
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition font-medium"
            >
              Back to Pricing
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
