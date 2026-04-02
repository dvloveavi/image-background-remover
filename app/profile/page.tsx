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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="py-6 px-4 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-slate-400 hover:text-white">← Back to Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">My Account</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Info */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              {session.user.image && (
                <img src={session.user.image} alt="" className="w-16 h-16 rounded-full" />
              )}
              <div>
                <p className="text-white font-medium">{session.user.name}</p>
                <p className="text-slate-400 text-sm">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Credits</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">HD Credits</span>
                  <span className="text-white font-medium">{credits.credits}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${Math.min(credits.credits * 33, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Preview Credits</span>
                  <span className="text-white font-medium">{credits.preview_credits}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${Math.min(credits.preview_credits * 50, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <Link 
              href="/pricing"
              className="mt-4 block w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-lg transition font-medium"
            >
              Buy More Credits
            </Link>
          </div>
        </div>

        {/* Subscription */}
        <div className="mt-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Subscription</h2>
          <p className="text-slate-400">
            Current Plan: <span className="text-white font-medium capitalize">{credits.subscription_tier}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
