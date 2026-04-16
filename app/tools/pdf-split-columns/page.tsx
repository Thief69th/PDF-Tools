'use client';

import React, { useState, useRef } from 'react';
import {
  FileText, X, ArrowRight, Loader2, Columns,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js';

function fmt(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

// Kindle Paperwhite dimensions in pt
const KINDLE_W = 297;
const KINDLE_H = 396;
const DPI_SCALE = 150 / 72;

export default function PdfSplitColumnsPage() {
  const [file, setFile]   = useState<File | null>(null);
  const [cols, setCols]   = useState<2 | 3>(2);
  const [gap, setGap]     = useState(2); // % gap between columns to ignore
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ msg: string; pct: number } | null>(null);
  const [done, setDone]   = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo]   = useState<{ orig: number; pages: number; outPages: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Please select a PDF.'); return; }
    setFile(f); setDone(false); setError(null); setInfo(null);
  };
  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setDone(false); setError(null); }
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true); setDone(false); setError(null);
    setProgress({ msg: 'Loading PDF…', pct: 5 });

    try {
      const buf = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
      const totalPages = pdfDoc.numPages;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Output PDF — portrait Kindle size
      const outPdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [KINDLE_W, KINDLE_H],
        compress: true,
      });
      let firstPage = true;
      let outPageCount = 0;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgress({
          msg: `Splitting page ${pageNum} of ${totalPages}…`,
          pct: 5 + Math.round((pageNum / totalPages) * 85),
        });

        const page = await pdfDoc.getPage(pageNum);
        const vp   = page.getViewport({ scale: DPI_SCALE });
        canvas.width  = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        // Slice canvas into N columns
        const colWidth = canvas.width / cols;
        const gapPx    = canvas.width * (gap / 100);

        for (let c = 0; c < cols; c++) {
          const srcX  = Math.round(c * colWidth + gapPx / 2);
          const srcW  = Math.round(colWidth - gapPx);
          const srcH  = canvas.height;

          // Draw just this column into a temp canvas
          const col = document.createElement('canvas');
          col.width  = srcW;
          col.height = srcH;
          const cctx = col.getContext('2d')!;
          cctx.fillStyle = '#ffffff';
          cctx.fillRect(0, 0, srcW, srcH);
          cctx.drawImage(canvas, srcX, 0, srcW, srcH, 0, 0, srcW, srcH);

          const imgData = col.toDataURL('image/jpeg', 0.88);

          // Scale to Kindle page
          const scale2  = Math.min(KINDLE_W / srcW * DPI_SCALE, KINDLE_H / srcH * DPI_SCALE);
          const drawW   = (srcW / DPI_SCALE) * scale2 * (KINDLE_W / (srcW / DPI_SCALE * scale2));
          const drawH   = (srcH / DPI_SCALE) * scale2 * (KINDLE_H / (srcH / DPI_SCALE * scale2));
          // Simpler: fit column image into KINDLE dimensions
          const fitScale = Math.min(KINDLE_W / (srcW / DPI_SCALE), KINDLE_H / (srcH / DPI_SCALE));
          const fw = (srcW / DPI_SCALE) * fitScale;
          const fh = (srcH / DPI_SCALE) * fitScale;
          const fx = (KINDLE_W  - fw) / 2;
          const fy = (KINDLE_H - fh) / 2;

          if (!firstPage) outPdf.addPage([KINDLE_W, KINDLE_H], 'p');
          outPdf.addImage(imgData, 'JPEG', fx, fy, fw, fh, undefined, 'FAST');
          firstPage = false;
          outPageCount++;
        }
      }

      setProgress({ msg: 'Generating download…', pct: 95 });
      const pdfBytes = outPdf.output('arraybuffer');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `kindle-columns-${file.name}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setInfo({ orig: file.size, pages: totalPages, outPages: outPageCount });
      setDone(true);
      setProgress(null);
    } catch (err: any) {
      setError(err.message || 'Conversion failed');
      setProgress(null);
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
          <span>Split PDF Columns</span>
        </nav>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <Columns size={12} /> Kindle Column Fix
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Split PDF Columns</h1>
          <p className="mt-3 text-base opacity-60 max-w-xl mx-auto">
            Academic papers, magazines, and newspapers often use 2–3 columns. This tool splits each column into its own Kindle-sized page so text is big and readable.
          </p>
        </div>

        {/* Settings */}
        <div className="mb-6 rounded-2xl p-5 space-y-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">Columns per Page</p>
            <div className="flex gap-3">
              {([2, 3] as const).map(n => (
                <button key={n} onClick={() => setCols(n)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all"
                  style={cols === n
                    ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-fg)' }
                    : { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }
                  }>
                  {n === 2 ? '2 Columns' : '3 Columns'}
                  <span className="block text-[10px] font-normal opacity-60 mt-0.5">
                    {n === 2 ? 'Academic papers, newspapers' : 'Magazines, brochures'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs opacity-60 mb-2">
              <span className="font-semibold">Column gap to trim</span>
              <span>{gap}%</span>
            </div>
            <input type="range" min={0} max={10} step={0.5} value={gap}
              onChange={e => setGap(+e.target.value)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: 'var(--accent)', background: 'var(--border)' }} />
            <p className="text-[11px] opacity-40 mt-1.5">Increase if you see column dividers / gutters in the output</p>
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
              <Columns className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <p className="font-bold text-lg">Drop multi-column PDF here or click to select</p>
            <p className="mt-2 text-sm opacity-50">Research papers, journals, magazines, newspapers</p>
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
                  <p className="text-xs opacity-50">{fmt(file.size)}{info ? ` · ${info.pages} pages → ${info.outPages} Kindle pages` : ''}</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setDone(false); setError(null); setInfo(null); }}
                className="p-2 rounded-full opacity-50 hover:opacity-100"><X size={16} /></button>
            </div>

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
                <p className="text-sm"><span className="font-bold">Error: </span>{error}</p>
              </div>
            )}

            {done && info && (
              <div className="rounded-xl p-4" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                <div className="flex items-center gap-3 font-bold">
                  <CheckCircle2 size={18} />
                  <span>Done! {info.pages} pages × {cols} columns = {info.outPages} Kindle pages</span>
                </div>
                <p className="text-xs mt-2 opacity-80">📱 Send to Kindle via email or the Send to Kindle app.</p>
              </div>
            )}

            <button onClick={convert} disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all disabled:opacity-40 hover:opacity-85"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />{progress?.msg || 'Processing…'}</>
                : <><Columns size={16} />Split {cols} Columns for Kindle</>
              }
            </button>
          </div>
        )}

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📰', title: 'Academic Papers',  desc: 'IEEE, Springer, Nature — two-column journal PDFs become perfectly readable.' },
            { icon: '📖', title: 'Each Column = Page', desc: 'Every column becomes a full Kindle-sized page. No more zooming or panning.' },
            { icon: '🔒', title: '100% Private',     desc: 'Canvas-based rendering. No server. No upload. Runs entirely in your browser.' },
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
