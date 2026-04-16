'use client';

import React, { useState, useRef } from 'react';
import {
  FileText, X, ArrowRight, Loader2, Tablet,
  CheckCircle2, AlertCircle, Monitor
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument, degrees } from 'pdf-lib';

function fmt(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

const DEVICES = [
  {
    id: 'paperwhite',
    label: 'Kindle Paperwhite',
    icon: '📖',
    widthPt: 297,  // ~4.13" at 72dpi
    heightPt: 396, // ~5.5" at 72dpi
    desc: '6" · 300 PPI · Most popular',
  },
  {
    id: 'oasis',
    label: 'Kindle Oasis',
    icon: '📗',
    widthPt: 346,
    heightPt: 461,
    desc: '7" · 300 PPI',
  },
  {
    id: 'scribe',
    label: 'Kindle Scribe',
    icon: '✏️',
    widthPt: 520,
    heightPt: 693,
    desc: '10.2" · 300 PPI · Best for PDFs',
  },
  {
    id: 'basic',
    label: 'Kindle Basic',
    icon: '📕',
    widthPt: 283,
    heightPt: 377,
    desc: '6" · 167 PPI',
  },
  {
    id: 'fire7',
    label: 'Fire 7 Tablet',
    icon: '🔥',
    widthPt: 360,
    heightPt: 600,
    desc: '7" · 171 PPI',
  },
  {
    id: 'fire10',
    label: 'Fire HD 10',
    icon: '🔥',
    widthPt: 540,
    heightPt: 864,
    desc: '10.1" · 224 PPI',
  },
];

export default function PdfForKindlePage() {
  const [file, setFile]       = useState<File | null>(null);
  const [device, setDevice]   = useState('paperwhite');
  const [margin, setMargin]   = useState(10); // pt
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [origSize, setOrigSize] = useState(0);
  const [newSize, setNewSize]   = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Please select a PDF.'); return; }
    setFile(f); setOrigSize(f.size); setDone(false); setError(null);
  };
  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setOrigSize(f.size); setDone(false); setError(null); }
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true); setDone(false); setError(null);

    const dev = DEVICES.find(d => d.id === device)!;

    try {
      const buf = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buf);
      const outDoc = await PDFDocument.create();

      const pages = srcDoc.getPages();
      setPageCount(pages.length);

      for (let i = 0; i < pages.length; i++) {
        const srcPage = pages[i];
        const { width: srcW, height: srcH } = srcPage.getSize();

        // Target dimensions with margin
        const targetW = dev.widthPt  - margin * 2;
        const targetH = dev.heightPt - margin * 2;

        // Determine scale to fit
        const scale = Math.min(targetW / srcW, targetH / srcH);

        // Embed source page
        const [embedded] = await outDoc.embedPages([srcPage]);

        // Add new page at device size
        const newPage = outDoc.addPage([dev.widthPt, dev.heightPt]);

        // Center the scaled page
        const scaledW = srcW * scale;
        const scaledH = srcH * scale;
        const x = (dev.widthPt - scaledW) / 2;
        const y = (dev.heightPt - scaledH) / 2;

        newPage.drawPage(embedded, {
          x, y,
          width: scaledW,
          height: scaledH,
        });
      }

      const pdfBytes = await outDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setNewSize(blob.size);

      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href = url;
      a.download = `${dev.id}-${file.name}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to convert PDF');
    } finally {
      setLoading(false);
    }
  };

  const sel = DEVICES.find(d => d.id === device)!;

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span>PDF for Kindle</span>
        </nav>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Tablet size={12} /> Browser Only · No Upload
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">PDF for Kindle</h1>
          <p className="mt-3 text-base opacity-60 max-w-lg mx-auto">
            Resize PDF pages to exact Kindle or Fire tablet screen dimensions. Text and images scale perfectly — no more tiny text or side scrolling.
          </p>
        </div>

        {/* Device grid */}
        <div className="mb-6 rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">Choose Device</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DEVICES.map(d => (
              <button key={d.id} onClick={() => setDevice(d.id)}
                className="flex items-start gap-3 rounded-xl p-3 text-left border-2 transition-all"
                style={device === d.id
                  ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-fg)' }
                  : { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }
                }>
                <span className="text-xl shrink-0">{d.icon}</span>
                <div>
                  <p className="font-bold text-xs leading-tight">{d.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">{d.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Margin slider */}
          <div className="mt-4">
            <div className="flex justify-between text-xs opacity-60 mb-2">
              <span className="font-semibold">Margin</span>
              <span>{margin}pt ({(margin * 0.353).toFixed(1)}mm)</span>
            </div>
            <input type="range" min={0} max={30} value={margin} onChange={e => setMargin(+e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: 'var(--accent)', background: 'var(--border)' }} />
          </div>

          {/* Preview spec */}
          <div className="mt-4 flex items-center gap-3 rounded-xl p-3 text-xs"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <Monitor size={14} className="opacity-50 shrink-0" />
            <span className="opacity-70">
              Output: <strong>{sel.widthPt} × {sel.heightPt} pt</strong>
              {' '}({(sel.widthPt * 25.4 / 72).toFixed(1)}mm × {(sel.heightPt * 25.4 / 72).toFixed(1)}mm)
              {' '}· Content area: <strong>{sel.widthPt - margin*2} × {sel.heightPt - margin*2} pt</strong>
            </span>
          </div>
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
              <Tablet className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <p className="font-bold text-lg">Drop PDF here or click to select</p>
            <p className="mt-2 text-sm opacity-50">Books, articles, documents — any PDF</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
                  <FileText size={18} style={{ color: 'var(--accent-fg)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs opacity-50">
                    {fmt(origSize)}
                    {newSize > 0 ? ` → ${fmt(newSize)}` : ''}
                    {pageCount > 0 ? ` · ${pageCount} pages` : ''}
                  </p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setDone(false); setNewSize(0); setPageCount(0); }}
                className="p-2 rounded-full opacity-50 hover:opacity-100"><X size={16} /></button>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm"><span className="font-bold">Error: </span>{error}</p>
              </div>
            )}

            {done && (
              <div className="rounded-xl p-4" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                <div className="flex items-center gap-3 font-bold">
                  <CheckCircle2 size={18} />
                  <span>Kindle PDF downloaded! {pageCount} pages optimised for {sel.label}.</span>
                </div>
                <p className="text-xs mt-2 opacity-80">
                  📧 Send to <strong>your-kindle@kindle.com</strong> &nbsp;·&nbsp;
                  📱 Use Send to Kindle app &nbsp;·&nbsp;
                  🔌 Copy to Kindle via USB → <strong>documents/</strong>
                </p>
              </div>
            )}

            <button onClick={convert} disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all disabled:opacity-40 hover:opacity-85"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Resizing pages…</>
                : <><Tablet size={16} />Optimise for {sel.label}</>
              }
            </button>
          </div>
        )}

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🔒', title: '100% Private',    desc: 'Runs entirely in your browser with pdf-lib. Nothing leaves your device.' },
            { icon: '📐', title: 'Pixel-perfect',   desc: 'Each page is scaled and centered to the exact Kindle resolution.' },
            { icon: '📱', title: '6 Devices',        desc: 'Paperwhite, Oasis, Scribe, Basic, Fire 7 and Fire HD 10 all supported.' },
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
