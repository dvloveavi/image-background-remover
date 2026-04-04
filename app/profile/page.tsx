import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserCredits } from '@/lib/db';
import Link from 'next/link';

export const runtime = 'edge';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const credits = await getUserCredits(session.user.id!);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1e 40%, #0a0f1e 70%, #0a0a0f 100%)' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 py-4 px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', background: 'rgba(10,10,15,0.6)' }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm transition-colors" style={{ color: 'rgba(160,160,190,0.7)' }}>
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-1">My Account</h1>
          <p className="text-sm" style={{ color: 'rgba(150,150,180,0.6)' }}>Manage your profile and credits</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: 'rgba(150,150,180,0.5)' }}>Profile</h2>
            <div className="flex items-center gap-4">
              {session.user.image ? (
                <img src={session.user.image} alt="" className="w-14 h-14 rounded-2xl" style={{ border: '2px solid rgba(124,58,237,0.4)' }} />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff' }}>
                  {session.user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-white">{session.user.name}</p>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(150,150,180,0.6)' }}>{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Credits Card */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: 'rgba(150,150,180,0.5)' }}>Credits</h2>
            <div className="space-y-4">
              {/* HD Credits */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'rgba(170,170,200,0.7)' }}>HD Credits</span>
                  <span className="font-bold text-white">{credits.credits}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(credits.credits * 33, 100)}%`,
                    background: 'linear-gradient(90deg, #7c3aed, #2563eb)',
                  }} />
                </div>
              </div>
              {/* Preview Credits */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'rgba(170,170,200,0.7)' }}>Preview Credits</span>
                  <span className="font-bold text-white">{credits.preview_credits}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(credits.preview_credits * 50, 100)}%`,
                    background: 'linear-gradient(90deg, #059669, #34d399)',
                  }} />
                </div>
              </div>
            </div>
            <Link
              href="/pricing"
              className="mt-6 block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
              }}
            >
              + Buy More Credits
            </Link>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="mt-6 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'rgba(150,150,180,0.5)' }}>Subscription</h2>
          <div className="flex items-center justify-between">
            <p style={{ color: 'rgba(170,170,200,0.7)' }}>
              Current Plan
            </p>
            <span className="px-3 py-1 rounded-lg text-sm font-semibold capitalize"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
              {credits.subscription_tier}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
