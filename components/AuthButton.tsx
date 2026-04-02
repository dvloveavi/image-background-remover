'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="text-yellow-400 text-sm">⚡ Mounting...</span>;
  }

  if (status === 'loading') {
    return <span className="text-slate-400 text-sm">⏳ Loading...</span>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image && (
          <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
        )}
        <span className="text-white text-sm">{session.user.name}</span>
        <button
          onClick={() => signOut()}
          className="text-slate-400 hover:text-white text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition font-medium text-sm"
    >
      🔐 Sign in with Google
    </button>
  );
}
