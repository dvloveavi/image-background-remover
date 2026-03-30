'use client';

import { useState, useRef, useCallback } from 'react';
import AuthButton from '@/components/AuthButton';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setImage(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const removeBackground = async () => {
    if (!originalImage) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: originalImage }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove background');
      }
      const data = await response.json();
      setImage(`data:image/png;base64,${data.result}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = 'removed-background.png';
    link.click();
  };

  const reset = () => {
    setImage(null);
    setOriginalImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="py-6 px-4 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">RemoveBG</h1>
          <nav className="flex gap-4 items-center">
            <a href="/about" className="text-slate-400 hover:text-white transition">About</a>
            <a href="/privacy" className="text-slate-400 hover:text-white transition">Privacy</a>
            <AuthButton />
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-3">Remove Image Background</h2>
          <p className="text-slate-400">Upload an image and remove its background with one click</p>
        </div>

        {!image ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
              dragOver 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
            }`}
          >
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-xl text-white mb-2">Drop your image here</p>
            <p className="text-slate-400 text-sm">or click to browse</p>
            <p className="text-slate-500 text-xs mt-4">Supports JPG, PNG, WebP (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Original</span>
                <button onClick={reset} className="text-sm text-red-400 hover:text-red-300 transition">
                  Remove
                </button>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-64">
                <img src={originalImage!} alt="Original" className="max-w-full max-h-80 object-contain" />
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Result</span>
                {image !== originalImage && (
                  <button onClick={downloadResult} className="text-sm text-green-400 hover:text-green-300 transition">
                    Download PNG
                  </button>
                )}
              </div>
              <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-64 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCI+PHJlY3QgZmlsbD0iI2MzYzRjNyIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIi8+PHJlY3Qgdmlld0JveD0iMCAwIDMwIDMwIiBmaWxsPSIjY2IzYjViIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiLz48L3N2Zz4=')]">
                <img src={image!} alt="Result" className="max-w-full max-h-80 object-contain" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {image && (
          <div className="mt-8 text-center">
            <button
              onClick={removeBackground}
              disabled={loading || image !== originalImage}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                '✨ Remove Background'
              )}
            </button>
            <p className="text-slate-500 text-sm mt-3">Powered by Remove.bg API</p>
          </div>
        )}
      </main>

      <footer className="py-6 px-4 border-t border-slate-700/50 mt-12">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          © 2026 RemoveBG. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
