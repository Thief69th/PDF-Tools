'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import {
  FileText, X, ArrowRight, Loader2, Unlock, Lock,
  Eye, EyeOff, CheckCircle2, AlertCircle, ShieldOff
} from 'lucide-react';
import Link from 'next/link';

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UnlockPdfPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [noPassword, setNoPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Please select a PDF file.'); return; }
    setFile(f); setDone(false); setError(null); setResultSize(0);
  };
  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setDone(false); setError(null); }
  };

  const unlock = async () => {
    if (!file) return;
    setLoading(true); setError(null); setDone(false);

    try {
      const buf    = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));

      const res = await fetch('/api/unlock-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, password }),
      });

      const data = await res.json();

      if (res.status === 401 || data.error === 'wrong_password') {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Decryption failed');

      const bytes = Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: 'application/pdf' });
      setResultSize(blob.size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unlocked-${file.name}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to unlock PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-4xl">

        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span>Unlock PDF</span>
        </nav>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <ShieldOff size={12} /> Remove Password
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Unlock PDF</h1>
          <p className="mt-3 text-base opacity-60 max-w-lg mx-auto">
            Remove password protection from any PDF. File processed and deleted from server instantly — never stored.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { step: '①', label: 'Upload PDF',       desc: 'Sent securely over HTTPS' },
            { step: '②', label: 'Password verified', desc: 'qpdf decrypts in RAM only' },
            { step: '③', label: 'File auto-deleted', desc: 'Zero bytes remain on server' },
          ].map((s, i) => (
            <div key={i} className="text-center rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-xl font-black mb-1" style={{ color: 'var(--accent)' }}>{s.step}</div>
              <p className="font-bold text-xs">{s.label}</p>
              <p className="text-[11px] opacity-50 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Upload */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={drop} onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-14 text-center cursor-pointer transition-all hover:opacity-70"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <input type="file" ref={fileInputRef} onChange={pick} accept="application/pdf" className="hidden" />
            <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--accent)' }}>
              <Unlock className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <p className="font-bold text-lg">Drop locked PDF here or click to select</p>
            <p className="mt-2 text-sm opacity-50">Works with RC4 and AES-encrypted PDFs</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* File info */}
            <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
                  <Lock size={18} style={{ color: 'var(--accent-fg)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs opacity-50">{fmt(file.size)}{resultSize > 0 ? ` → ${fmt(resultSize)} unlocked` : ''}</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setDone(false); setError(null); }} className="p-2 rounded-full opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </div>

            {/* Password input */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm uppercase tracking-widest opacity-40">Enter Password</h3>

              {/* Try without password toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={noPassword}
                  onChange={e => { setNoPassword(e.target.checked); if (e.target.checked) setPassword(''); }}
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="opacity-70">PDF has no password (remove restrictions only)</span>
              </label>

              {!noPassword && (
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(null); }}
                    onKeyDown={e => e.key === 'Enter' && unlock()}
                    placeholder="Enter PDF password"
                    className="w-full rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none"
                    style={{
                      background: 'var(--bg)',
                      border: `1px solid ${error?.includes('Incorrect') ? '#ef4444' : 'var(--border)'}`,
                      color: 'var(--fg)'
                    }}
                  />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid #ef4444' }}>
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-red-500">{error}</p>
                  {error.includes('Incorrect') && (
                    <p className="text-xs opacity-60 mt-1">Make sure Caps Lock is off. Try the owner password if the user password doesn't work.</p>
                  )}
                </div>
              </div>
            )}

            {/* Success */}
            {done && (
              <div className="flex items-center gap-3 rounded-xl p-4 font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                <CheckCircle2 size={18} />
                <div>
                  <p>PDF unlocked and downloaded!</p>
                  <p className="text-xs font-normal opacity-80 mt-0.5">Server file auto-deleted. Open without password from now on.</p>
                </div>
              </div>
            )}

            {/* Button */}
            <button
              onClick={unlock}
              disabled={loading || (!noPassword && !password)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all disabled:opacity-40 hover:opacity-85"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Removing password…</>
                : <><Unlock size={16} />Unlock &amp; Download</>
              }
            </button>

            {done && (
              <button
                onClick={() => { setFile(null); setDone(false); setPassword(''); }}
                className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold opacity-50 hover:opacity-100"
                style={{ border: '1px solid var(--border)' }}
              >
                Unlock another PDF
              </button>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🔓', title: 'All Encryption Types', desc: 'Supports RC4-40, RC4-128, AES-128, AES-256 — all standard PDF encryption.' },
            { icon: '🗑️', title: 'Instant Deletion',     desc: 'File is deleted from server the moment your download starts. Zero logs.' },
            { icon: '🔒', title: 'HTTPS Only',            desc: 'PDF travels encrypted over TLS. Nobody can intercept it in transit.' },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs opacity-60">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
