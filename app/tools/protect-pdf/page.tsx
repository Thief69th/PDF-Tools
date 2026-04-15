'use client';

import React, { useState, useRef } from 'react';
import {
  FileText, X, ArrowRight, Loader2, Lock, ShieldCheck,
  Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function strength(pw: string): { label: string; color: string; pct: number } {
  if (!pw) return { label: '', color: 'var(--border)', pct: 0 };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak',   color: '#ef4444', pct: 25 };
  if (score <= 3) return { label: 'Medium', color: '#f59e0b', pct: 60 };
  return               { label: 'Strong', color: '#22c55e', pct: 100 };
}

const RESTRICTION_LABELS = [
  { key: 'print',    label: 'Allow Printing' },
  { key: 'modify',   label: 'Allow Editing' },
  { key: 'copy',     label: 'Allow Copying Text' },
  { key: 'annotate', label: 'Allow Annotations' },
];

export default function ProtectPdfPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [password, setPassword]       = useState('');
  const [ownerPass, setOwnerPass]     = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [showOwner, setShowOwner]     = useState(false);
  const [restrictions, setRestrictions] = useState({
    print: true, modify: false, copy: false, annotate: false,
  });
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [resultSize, setResultSize]   = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Please select a PDF file.'); return; }
    setFile(f); setDone(false); setError(null);
  };
  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setDone(false); setError(null); }
  };

  const protect = async () => {
    if (!file || !password) return;
    setLoading(true); setError(null); setDone(false);

    try {
      // Read PDF as base64
      const buf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));

      const res = await fetch('/api/protect-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: base64,
          userPassword: password,
          ownerPassword: ownerPass || password,
          restrictions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Protection failed');
      }

      // Decode and download
      const bytes = Uint8Array.from(atob(data.pdfBase64), c => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: 'application/pdf' });
      setResultSize(blob.size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `protected-${file.name}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to protect PDF');
    } finally {
      setLoading(false);
    }
  };

  const pw = strength(password);

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-4xl">

        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span>Protect PDF</span>
        </nav>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <ShieldCheck size={12} /> AES-256 Encryption
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Protect PDF</h1>
          <p className="mt-3 text-base opacity-60 max-w-lg mx-auto">
            Real AES-256 password protection. Your file is encrypted server-side and deleted instantly — never stored.
          </p>
        </div>

        {/* How it works strip */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { step: '①', label: 'Upload PDF',          desc: 'Sent securely over HTTPS' },
            { step: '②', label: 'AES-256 Encrypted',   desc: 'Server processes in RAM only' },
            { step: '③', label: 'File auto-deleted',   desc: 'Zero bytes remain on server' },
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
              <Lock className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <p className="font-bold text-lg">Drop PDF here or click to select</p>
            <p className="mt-2 text-sm opacity-50">Encrypted with AES-256 · File deleted after download</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* File info */}
            <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
                  <FileText size={18} style={{ color: 'var(--accent-fg)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs opacity-50">{fmt(file.size)}{resultSize > 0 ? ` → ${fmt(resultSize)} encrypted` : ''}</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setDone(false); setError(null); }} className="p-2 rounded-full opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </div>

            {/* Password settings */}
            <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm uppercase tracking-widest opacity-40">Password Settings</h3>

              {/* User password */}
              <div>
                <label className="text-xs font-bold mb-2 block opacity-70">Open Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setDone(false); }}
                    placeholder="Password to open the PDF"
                    className="w-full rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                  />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pw.pct}%`, background: pw.color }} />
                    </div>
                    <p className="text-[11px] mt-1 font-semibold" style={{ color: pw.color }}>{pw.label}</p>
                  </div>
                )}
              </div>

              {/* Owner password (optional) */}
              <div>
                <label className="text-xs font-bold mb-2 block opacity-70">Owner Password <span className="opacity-40">(optional — to control permissions)</span></label>
                <div className="relative">
                  <input
                    type={showOwner ? 'text' : 'password'}
                    value={ownerPass}
                    onChange={e => setOwnerPass(e.target.value)}
                    placeholder="Leave blank to use same password"
                    className="w-full rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                  />
                  <button onClick={() => setShowOwner(!showOwner)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                    {showOwner ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Restrictions */}
              <div>
                <label className="text-xs font-bold mb-3 block opacity-70 uppercase tracking-widest">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {RESTRICTION_LABELS.map(r => (
                    <label key={r.key} className="flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 transition-all"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <input
                        type="checkbox"
                        checked={(restrictions as any)[r.key]}
                        onChange={e => setRestrictions(prev => ({ ...prev, [r.key]: e.target.checked }))}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span className="text-xs font-semibold">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Protection failed</p>
                  <p className="text-xs opacity-70 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Success */}
            {done && (
              <div className="flex items-center gap-3 rounded-xl p-4 font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                <CheckCircle2 size={18} />
                <div>
                  <p>AES-256 encrypted PDF downloaded!</p>
                  <p className="text-xs font-normal opacity-80 mt-0.5">Server file auto-deleted. Only you have the password.</p>
                </div>
              </div>
            )}

            {/* Button */}
            <button
              onClick={protect}
              disabled={loading || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all disabled:opacity-40 hover:opacity-85"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Encrypting with AES-256…</>
                : <><Lock size={16} />Protect &amp; Download</>
              }
            </button>
          </div>
        )}

        {/* Info */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🔐', title: 'Real AES-256',      desc: 'Industry-standard encryption. Same as banks. Compatible with Adobe, Preview, Edge.' },
            { icon: '🗑️', title: 'Auto-deleted',      desc: 'Your PDF is processed and immediately deleted from the server. Zero storage.' },
            { icon: '🔑', title: 'Your Key Only',     desc: 'Password never stored, never logged. Only you can open the protected file.' },
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
