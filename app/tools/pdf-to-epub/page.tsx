'use client';

import React, { useState, useRef } from 'react';
import {
  FileText, X, ArrowRight, Loader2, BookOpen,
  CheckCircle2, AlertCircle, Sparkles, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

function fmt(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ar', label: 'Arabic' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
];

export default function PdfToEpubPage() {
  const [file, setFile]       = useState<File | null>(null);
  const [title, setTitle]     = useState('');
  const [author, setAuthor]   = useState('');
  const [lang, setLang]       = useState('en');
  const [toc, setToc]         = useState(true);
  const [progress, setProgress] = useState<{ msg: string; pct: number } | null>(null);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [stats, setStats]     = useState<{ pages: number; chars: number; chapters: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Please select a PDF file.'); return; }
    setFile(f); setDone(false); setError(null); setStats(null);
    // Auto-fill title from filename
    const name = f.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    setTitle(name.charAt(0).toUpperCase() + name.slice(1));
  };
  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setDone(false); setError(null); }
  };

  const convert = async () => {
    if (!file) return;
    setDone(false); setError(null); setStats(null);
    setProgress({ msg: 'Loading PDF…', pct: 5 });

    try {
      // Extract text with pdfjs
      const buf = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
      const totalPages = pdfDoc.numPages;
      let fullText = '';

      for (let i = 1; i <= totalPages; i++) {
        setProgress({ msg: `Extracting page ${i} of ${totalPages}…`, pct: 5 + Math.round((i / totalPages) * 50) });
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s{3,}/g, '\n\n');
        fullText += pageText + '\n\n';
      }

      if (fullText.trim().length < 50) {
        throw new Error('Could not extract text from this PDF. It may be a scanned image PDF.');
      }

      setProgress({ msg: 'Sending to EPUB builder…', pct: 58 });

      const res = await fetch('/api/pdf-to-epub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          title: title || file.name.replace(/\.pdf$/i, ''),
          author: author || 'Unknown',
          language: lang,
          includeToc: toc,
        }),
      });

      setProgress({ msg: 'Building EPUB…', pct: 80 });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'EPUB generation failed');
      }

      const data = await res.json();
      setProgress({ msg: 'Preparing download…', pct: 95 });

      const bytes = Uint8Array.from(atob(data.epubBase64), c => c.charCodeAt(0));
      const blob  = new Blob([bytes], { type: 'application/epub+zip' });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement('a');
      a.href = url;
      a.download = (title || file.name.replace(/\.pdf$/i, '')) + '.epub';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStats({ pages: totalPages, chars: fullText.length, chapters: data.chapters || 0 });
      setDone(true);
      setProgress(null);
    } catch (err: any) {
      setError(err.message || 'Conversion failed');
      setProgress(null);
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
          <span>PDF to EPUB</span>
        </nav>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <BookOpen size={12} /> Kindle Ready
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">PDF to EPUB</h1>
          <p className="mt-3 text-base opacity-60 max-w-lg mx-auto">
            Convert any PDF to EPUB — readable on Kindle, Apple Books, Kobo, and all e-readers. Text reflows to any screen size.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { step: '①', label: 'Upload PDF',    desc: 'Text extracted locally' },
            { step: '②', label: 'Build EPUB',    desc: 'Chapters auto-detected' },
            { step: '③', label: 'Send to Kindle',desc: 'Via email or USB' },
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
            onDrop={drop} onDragOver={e => e.preventDefault()}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-14 text-center cursor-pointer transition-all hover:opacity-70"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <input type="file" ref={fileInputRef} onChange={pick} accept="application/pdf" className="hidden" />
            <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--accent)' }}>
              <BookOpen className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <p className="font-bold text-lg">Drop PDF here or click to select</p>
            <p className="mt-2 text-sm opacity-50">Books, reports, articles — any text-based PDF</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File row */}
            <div className="flex items-center justify-between rounded-2xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
                  <FileText size={18} style={{ color: 'var(--accent-fg)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs opacity-50">{fmt(file.size)}</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setDone(false); setError(null); }}
                className="p-2 rounded-full opacity-50 hover:opacity-100"><X size={16} /></button>
            </div>

            {/* Metadata */}
            <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Book Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold opacity-60 block mb-1.5">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Book title"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold opacity-60 block mb-1.5">Author</label>
                  <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold opacity-60 block mb-1.5">Language</label>
                  <select value={lang} onChange={e => setLang(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 w-full"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <input type="checkbox" checked={toc} onChange={e => setToc(e.target.checked)}
                      className="w-4 h-4" style={{ accentColor: 'var(--accent)' }} />
                    <span className="text-xs font-semibold">Table of Contents</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Progress */}
            {progress && (
              <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between text-xs mb-2 opacity-60">
                  <span className="font-mono">{progress.msg}</span>
                  <span>{progress.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress.pct}%`, background: 'var(--accent)' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Conversion failed</p>
                  <p className="text-xs opacity-70 mt-0.5">{error}</p>
                  {error.includes('scanned') && (
                    <p className="text-xs mt-2 opacity-60">→ Scanned PDFs need OCR first. Try <Link href="/tools/pdf-to-text" className="underline">PDF to Text</Link> with an OCR-enabled tool.</p>
                  )}
                </div>
              </div>
            )}

            {done && stats && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl p-4 font-bold"
                  style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                  <CheckCircle2 size={18} />
                  <span>EPUB downloaded! {stats.pages} pages · {(stats.chars/1000).toFixed(0)}K chars{stats.chapters > 0 ? ` · ${stats.chapters} chapters` : ''}</span>
                </div>
                <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <p className="font-bold text-xs mb-2 opacity-50 uppercase tracking-widest">Send to Kindle</p>
                  <p className="text-xs opacity-70">
                    📧 Email to <strong>your-kindle@kindle.com</strong> — add GENPDF.com to your approved senders in Manage Your Kindle.<br/>
                    📱 Or use the <strong>Send to Kindle app</strong> (iOS/Android/Desktop).<br/>
                    🔌 Or connect Kindle via USB and copy to the <strong>documents</strong> folder.
                  </p>
                </div>
              </div>
            )}

            {!done && (
              <button onClick={convert} disabled={!!progress}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all disabled:opacity-40 hover:opacity-85"
                style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                {progress
                  ? <><Loader2 className="h-4 w-4 animate-spin" />{progress.msg}</>
                  : <><BookOpen size={16} />Convert to EPUB</>
                }
              </button>
            )}
            {done && (
              <button onClick={() => { setFile(null); setDone(false); setStats(null); }}
                className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold opacity-50 hover:opacity-100"
                style={{ border: '1px solid var(--border)' }}>Convert another PDF</button>
            )}
          </div>
        )}

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📱', title: 'All E-Readers',   desc: 'Kindle, Kobo, Apple Books, Google Play Books, Nook — EPUB works everywhere.' },
            { icon: '📐', title: 'Text Reflows',    desc: 'Unlike PDF, EPUB adapts to any font size and screen. Perfect for reading.' },
            { icon: '📚', title: 'Chapters & TOC',  desc: 'Auto-detects chapter headings and generates a table of contents.' },
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
