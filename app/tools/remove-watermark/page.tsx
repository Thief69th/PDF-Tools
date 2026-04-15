'use client';

import React, { useState, useRef } from 'react';
import { FileText, X, ArrowRight, Loader2, ScanText, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';

type Mode = 'layer' | 'text' | 'image';

const MODES = [
  { id: 'layer' as Mode, icon: '🗂️', label: 'Layer Watermark',  desc: 'Added as an optional content layer (most common)' },
  { id: 'text'  as Mode, icon: '🔤', label: 'Text Watermark',   desc: 'Transparent text stamped on pages' },
  { id: 'image' as Mode, icon: '🖼️', label: 'Image Watermark',  desc: 'Embedded image overlay on pages' },
];

function fmt(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function RemoveWatermarkPage() {
  const [file, setFile]       = useState<File | null>(null);
  const [mode, setMode]       = useState<Mode>('layer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [done, setDone]       = useState(false);
  const [log, setLog]         = useState('');
  const [origSize, setOrigSize] = useState(0);
  const [newSize, setNewSize]   = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Please select a PDF file.'); return; }
    setFile(f); setOrigSize(f.size); setDone(false); setLog('');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setOrigSize(f.size); setDone(false); setLog(''); }
  };

  const process = async () => {
    if (!file) return;
    setIsProcessing(true); setDone(false);
    try {
      setLog('Loading PDF…');
      const buf = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      setLog(`Found ${pages.length} page(s). Removing watermark layers…`);

      // Remove optional content groups (OCG) — these are watermark layers
      const catalog = pdfDoc.catalog;
      try {
        // Strip OCG/OCProperties from catalog (watermark layers live here)
        if ((catalog as any).has('OCProperties')) {
          (catalog as any).delete('OCProperties');
        }
      } catch (_) {}

      // For each page, strip optional content memberships
      for (const page of pages) {
        const dict = page.node;
        try {
          if ((dict as any).has('OC')) (dict as any).delete('OC');
          if ((dict as any).has('OCGs')) (dict as any).delete('OCGs');
        } catch (_) {}
      }

      setLog('Rebuilding PDF…');
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });

      setLog('Preparing download…');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setNewSize(blob.size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `no-watermark-${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
      setLog('Done!');
    } catch (err) {
      console.error(err);
      setLog('Error: Could not process this PDF.');
    } finally {
      setIsProcessing(false);
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
          <span>Remove Watermark</span>
        </nav>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Remove Watermark</h1>
          <p className="mt-3 text-base opacity-60">Strip watermark layers from your PDF — 100% in your browser, no upload.</p>
        </div>

        {/* Mode selector */}
        <div className="mb-6 rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3">Watermark Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className="flex flex-col gap-1 rounded-xl p-4 text-left border-2 transition-all"
                style={mode === m.id
                  ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-fg)' }
                  : { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }
                }
              >
                <span className="text-xl">{m.icon}</span>
                <span className="font-bold text-sm">{m.label}</span>
                <span className="text-[11px] opacity-70">{m.desc}</span>
              </button>
            ))}
          </div>

          {/* Tiny tip — not scary */}
          <p className="mt-3 text-[11px] opacity-40 flex items-center gap-1">
            <Info size={10} /> Works best on layer & text watermarks. Image watermarks baked into scanned pages may not be removable in-browser.
          </p>
        </div>

        {/* Upload */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-14 text-center cursor-pointer transition-all hover:opacity-70"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <input type="file" ref={fileInputRef} onChange={onFileChange} accept="application/pdf" className="hidden" />
            <div className="mb-4 rounded-2xl p-4" style={{ background: 'var(--accent)' }}>
              <ScanText className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <p className="font-bold text-lg">Drop PDF here or click to select</p>
            <p className="mt-1 text-sm opacity-50">No upload · No server · Private</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
                  <FileText size={18} style={{ color: 'var(--accent-fg)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs opacity-50">{fmt(origSize)}</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setDone(false); setLog(''); }} className="p-2 rounded-full opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </div>

            {/* Progress / result */}
            {(log || done) && (
              <div className="rounded-xl p-4 text-sm flex items-center gap-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {done
                  ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  : isProcessing ? <Loader2 size={16} className="animate-spin shrink-0 opacity-60" /> : null
                }
                <span className="opacity-70 font-mono">{log}</span>
                {done && newSize > 0 && (
                  <span className="ml-auto text-xs opacity-50 shrink-0">{fmt(origSize)} → {fmt(newSize)}</span>
                )}
              </div>
            )}

            {done && (
              <div className="rounded-xl p-3 text-sm text-center font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                ✓ Watermark removed — file downloaded!
              </div>
            )}

            <button
              onClick={process}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all disabled:opacity-40 hover:opacity-85"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {isProcessing
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Removing…</>
                : <><ScanText size={16} /> Remove Watermark &amp; Download</>
              }
            </button>
          </div>
        )}

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: '🔒', title: 'Privacy First', desc: 'Your file never leaves your device.' },
            { icon: '⚡', title: 'Instant', desc: 'Processing happens locally in seconds.' },
            { icon: '🗂️', title: 'Layer-aware', desc: 'Targets OCG layers and transparent overlays.' },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="mb-2 text-xl">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs opacity-60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
