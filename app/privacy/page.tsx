import Link from 'next/link';

export default function Privacy() {
  const sections = [
    {
      icon: '🗂️',
      title: 'Data Collection',
      content: 'We do not store your images on our servers. All image processing happens in memory, and your images are immediately discarded after processing is complete.',
    },
    {
      icon: '🔗',
      title: 'Third-Party Services',
      content: "We use the Remove.bg API to process images. Your image data is sent to Remove.bg solely for the purpose of background removal. Please refer to Remove.bg's privacy policy for information about how they handle your data.",
    },
    {
      icon: '🍪',
      title: 'Cookies',
      content: 'We use only essential session cookies required for authentication (Google Sign-In). We do not use any advertising or tracking cookies.',
    },
    {
      icon: '📊',
      title: 'Analytics',
      content: 'We may collect basic analytics data such as page views and error logs to improve our service. This data is aggregated and does not contain any personal information.',
    },
    {
      icon: '👤',
      title: 'Account Data',
      content: 'When you sign in with Google, we store your email address, display name, and profile picture to power your account. We store usage logs to track your credit consumption. You can request data deletion by contacting us.',
    },
    {
      icon: '✉️',
      title: 'Contact',
      content: 'If you have any questions about this privacy policy, please contact us at support@imagebackground-remover.online.',
    },
    {
      icon: '🔄',
      title: 'Changes to This Policy',
      content: 'We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1e 40%, #0a0f1e 70%, #0a0a0f 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-12" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      </div>

      <header className="relative z-10 py-4 px-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', background: 'rgba(10,10,15,0.6)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>✂️</div>
            <span className="text-lg font-bold text-white">RemoveBG</span>
          </Link>
          <nav className="flex gap-4 text-sm" style={{ color: 'rgba(160,160,190,0.7)' }}>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <span className="text-white font-medium">Privacy</span>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            🔒 Your data, our responsibility
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
          <p className="text-sm" style={{ color: 'rgba(140,140,170,0.6)' }}>Last updated: April 4, 2026</p>
        </div>

        <div className="space-y-4">
          {sections.map(({ icon, title, content }) => (
            <div key={title} className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="flex items-center gap-2.5 text-base font-semibold text-white mb-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  {icon}
                </span>
                {title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(170,170,200,0.75)' }}>{content}</p>
            </div>
          ))}
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
