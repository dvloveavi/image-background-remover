'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    return (
      <div className="w-24 h-8 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" style={{ border: '1px solid rgba(124,58,237,0.5)' }} />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff' }}>
            {session.user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-white hidden sm:block" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session.user.name?.split(' ')[0]}
        </span>
        <button
          onClick={() => signOut()}
          className="text-xs px-2.5 py-1 rounded-lg transition-all"
          style={{ color: 'rgba(160,160,190,0.7)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
      style={{
        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
        color: '#fff',
        boxShadow: '0 2px 12px rgba(124,58,237,0.35)',
      }}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 11h8.533c.044.385.067.78.067 1.184C20.6 17.48 17.08 21 12 21A9 9 0 1 1 12 3c2.395 0 4.566.94 6.178 2.461l-2.545 2.545A5.502 5.502 0 0 0 12 6.5a5.5 5.5 0 1 0 4.93 7.956L12 11z"/>
      </svg>
      Sign in
    </button>
  );
}
