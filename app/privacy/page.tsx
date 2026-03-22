import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="py-6 px-4 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition">
            RemoveBG
          </Link>
          <nav className="flex gap-4">
            <Link href="/about" className="text-slate-400 hover:text-white transition">About</Link>
            <span className="text-white">Privacy</span>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-slate-300">
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Collection</h2>
            <p>
              We do not store your images on our servers. All image processing happens in memory, 
              and your images are immediately discarded after processing is complete.
            </p>
          </section>

          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
            <p>
              We use the Remove.bg API to process images. Your image data is sent to Remove.bg 
              solely for the purpose of background removal. Please refer to Remove.bg&apos;s privacy 
              policy for information about how they handle your data.
            </p>
          </section>

          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">Cookies</h2>
            <p>
              We do not use cookies or any other tracking technologies on our website.
            </p>
          </section>

          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">Analytics</h2>
            <p>
              We may collect basic analytics data such as page views and error logs to improve 
              our service. This data is aggregated and does not contain any personal information.
            </p>
          </section>

          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at 
              support@removebg.example.com.
            </p>
          </section>

          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be posted 
              on this page.
            </p>
          </section>

          <p className="text-slate-500 text-sm">
            Last updated: March 22, 2026
          </p>
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
