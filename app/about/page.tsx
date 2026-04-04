import Link from 'next/link';

const HEADER_STYLE = {
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  background: 'rgba(10,10,15,0.6)',
};

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1e 40%, #0a0f1e 70%, #0a0a0f 100%)' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }} />
      </div>

      <header className="relative z-10 py-4 px-6" style={HEADER_STYLE}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>✂️</div>
            <span className="text-lg font-bold text-white">RemoveBG</span>
          </Link>
          <nav className="flex gap-4 text-sm" style={{ color: 'rgba(160,160,190,0.7)' }}>
            <span className="text-white font-medium">About</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            ℹ️ About this tool
          </div>
          <h1 className="text-4xl font-extrabold text-white">About RemoveBG</h1>
        </div>

        <div className="space-y-5">
          {[
            {
              icon: '🖼️',
              title: 'What is RemoveBG?',
              content: 'RemoveBG is a simple, fast, and AI-powered tool for removing backgrounds from images. Upload any image and get a clean transparent PNG in seconds — no design skills needed.',
            },
            {
              icon: '⚙️',
              title: 'How It Works',
              steps: ['Upload your image (JPG, PNG, or WebP)', 'Click the "Remove Background" button', 'Download your image with a transparent background'],
            },
            {
              icon: '🚀',
              title: 'Technology',
              content: "Powered by state-of-the-art AI from Remove.bg, deployed on Cloudflare's global edge network for fast processing anywhere in the world.",
            },
            {
              icon: '🎯',
              title: 'Use Cases',
              grid: [
                'E-commerce product photography',
                'Profile pictures and social media',
                'Graphic design and illustrations',
                'Presentations and marketing materials',
              ],
            },
          ].map(({ icon, title, content, steps, grid }) => (
            <div key={title} className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-4">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  {icon}
                </span>
                {title}
              </h2>
              {content && <p className="text-sm leading-relaxed" style={{ color: 'rgba(180,180,210,0.8)' }}>{content}</p>}
              {steps && (
                <ol className="space-y-2">
                  {steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(180,180,210,0.8)' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff' }}>
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              )}
              {grid && (
                <ul className="grid md:grid-cols-2 gap-3">
                  {grid.map(g => (
                    <li key={g} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(180,180,210,0.8)' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>✓</span>
                      {g}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
            Try it Free →
          </Link>
        </div>
      </main>

      <footer className="relative z-10 mt-16 py-6 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto text-center text-sm" style={{ color: 'rgba(120,120,150,0.6)' }}>
          © 2026 RemoveBG. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
