import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="py-6 px-4 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition">
            RemoveBG
          </Link>
          <nav className="flex gap-4">
            <span className="text-white">About</span>
            <Link href="/privacy" className="text-slate-400 hover:text-white transition">Privacy</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">About RemoveBG</h1>
        
        <div className="space-y-6 text-slate-300">
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">What is RemoveBG?</h2>
            <p>
              RemoveBG is a simple, fast, and free tool for removing backgrounds from images. 
              Upload any image and get a transparent PNG in seconds — no signup required.
            </p>
          </section>

          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Upload your image (JPG, PNG, or WebP)</li>
              <li>Click the "Remove Background" button</li>
              <li>Download your image with a transparent background</li>
            </ol>
          </section>

          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">Technology</h2>
            <p>
              Powered by state-of-the-art AI from Remove.bg, deployed on Cloudflare&apos;s 
              global edge network for fast processing anywhere in the world.
            </p>
          </section>

          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">Use Cases</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>E-commerce product photography</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Profile pictures and social media</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Graphic design and illustrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>Presentations and marketing materials</span>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="py-6 px-4 border-t border-slate-700/50 mt-12">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          © 2026 RemoveBG. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
