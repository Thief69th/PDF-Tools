'use client';

import React, { useState, useRef } from 'react';
import { FileText, X, ArrowRight, Loader2, FileDown, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Use the installed worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js`;

const PRESETS = [
  { id: 'email',    label: 'Email',           icon: '📧', desc: 'Under 25 MB',  targetMB: 25,   quality: 0.88, dpi: 150 },
  { id: 'whatsapp', label: 'WhatsApp',        icon: '💬', desc: 'Under 16 MB',  targetMB: 16,   quality: 0.82, dpi: 130 },
  { id: 'upload',   label: 'Upload',          icon: '☁️', desc: 'Under 10 MB',  targetMB: 10,   quality: 0.76, dpi: 110 },
  { id: 'job',      label: 'Job Application', icon: '💼', desc: 'Under 2 MB',   targetMB: 2,    quality: 0.65, dpi: 96  },
  { id: 'resume',   label: 'Resume',          icon: '📄', desc: 'Under 500 KB', targetMB: 0.5,  quality: 0.58, dpi: 90  },
  { id: 'invoice',  label: 'Invoice',         icon: '🧾', desc: 'Under 300 KB', targetMB: 0.3,  quality: 0.52, dpi: 80  },
  { id: 'ebook',    label: 'eBook',           icon: '📚', desc: 'Under 5 MB',   targetMB: 5,    quality: 0.72, dpi: 120 },
  { id: 'report',   label: 'Report',          icon: '📊', desc: 'Under 3 MB',   targetMB: 3,    quality: 0.68, dpi: 110 },
  { id: 'form',     label: 'Form',            icon: '📋', desc: 'Under 1 MB',   targetMB: 1,    quality: 0.56, dpi: 85  },
  { id: 'document', label: 'Document',        icon: '📝', desc: 'Under 2 MB',   targetMB: 2,    quality: 0.65, dpi: 96  },
];

type PresetId = typeof PRESETS[number]['id'];

interface Result {
  originalBytes: number;
  compressedBytes: number;
  reduction: number;
  targetMB: number;
  achieved: boolean;
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function doCompress(
  file: File,
  quality: number,
  dpi: number,
  targetBytes: number,
  pass: number,
  onProgress: (msg: string, pct: number) => void
): Promise<Blob> {
  onProgress(pass > 1 ? `Pass ${pass}: Extra compression…` : 'Reading PDF…', pass > 1 ? 88 : 8);

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  onProgress(`Rendering ${totalPages} page(s)…`, 15);

  const scale = dpi / 72;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const firstPage = await pdfDoc.getPage(1);
  const vp0 = firstPage.getViewport({ scale });
  const pw = vp0.width / scale;
  const ph = vp0.height / scale;

  const pdf = new jsPDF({
    orientation: pw > ph ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [pw, ph],
    compress: true,
  });

  for (let i = 1; i <= totalPages; i++) {
    const pct = 15 + Math.round((i / totalPages) * 70);
    onProgress(`Compressing page ${i} / ${totalPages}…`, pct);

    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    canvas.width  = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport }).promise;

    const imgData = canvas.toDataURL('image/jpeg', quality);
    const pageW = viewport.width  / scale;
    const pageH = viewport.height / scale;

    if (i > 1) pdf.addPage([pageW, pageH], pageW > pageH ? 'l' : 'p');
    pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
  }

  onProgress('Finalising…', 88);
  const pdfBytes = pdf.output('arraybuffer');
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  if (blob.size > targetBytes && quality > 0.25 && pass < 3) {
    const ratio = targetBytes / blob.size;
    const newQ = Math.max(0.22, quality * ratio * 0.88);
    const newDpi = Math.max(60, Math.round(dpi * 0.88));
    return doCompress(file, newQ, newDpi, targetBytes, pass + 1, onProgress);
  }

  return blob;
}

export default function CompressPdfPage() {
  const [file, setFile]    = useState<File | null>(null);
  const [preset, setPreset] = useState<PresetId | null>(null);
  const [progress, setProgress] = useState<{ msg: string; pct: number } | null>(null);
  const [result, setResult]  = useState<Result | null>(null);
  const [dlUrl, setDlUrl]    = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { alert('Please select a PDF file.'); return; }
    setFile(f); setResult(null); setDlUrl(null); setProgress(null);
  };

  const drop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setResult(null); setDlUrl(null); setProgress(null); }
  };

  const compress = async () => {
    if (!file || !preset) return;
    const p = PRESETS.find(x => x.id === preset)!;
    const targetBytes = p.targetMB * 1024 * 1024;

    setProgress({ msg: 'Starting…', pct: 0 });
    setResult(null);
    if (dlUrl) URL.revokeObjectURL(dlUrl);

    try {
      const blob = await doCompress(file, p.quality, p.dpi, targetBytes, 1,
        (msg, pct) => setProgress({ msg, pct }));

      const url = URL.createObjectURL(blob);
      setDlUrl(url);
      setResult({
        originalBytes:   file.size,
        compressedBytes: blob.size,
        reduction: Math.round((1 - blob.size / file.size) * 100),
        targetMB: p.targetMB,
        achieved: blob.size <= targetBytes,
      });

      const a = document.createElement('a');
      a.href = url; a.download = `compressed-${file.name}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Compression failed. Please try again.');
    } finally {
      setProgress(null);
    }
  };

  const sel = PRESETS.find(p => p.id === preset);

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-5xl">

        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span>Compress PDF</span>
        </nav>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Compress PDF</h1>
          <p className="mt-3 text-base opacity-60">Choose your platform — we compress to fit. No upload. No server.</p>
        </div>

        {/* ── Step 1: Upload ── */}
        <div className="mb-5 rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">① Select PDF</p>

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={drop} onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer hover:opacity-70 transition-all"
              style={{ borderColor: 'var(--border)' }}
            >
              <input type="file" ref={fileInputRef} onChange={pick} accept="application/pdf" className="hidden" />
              <div className="mb-3 rounded-xl p-3" style={{ background: 'var(--accent)' }}>
                <FileDown className="h-6 w-6" style={{ color: 'var(--accent-fg)' }} />
              </div>
              <p className="font-semibold text-sm">Drop PDF here or click to select</p>
              <p className="text-xs mt-1 opacity-40">Stays 100% on your device</p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
                  <FileText size={16} style={{ color: 'var(--accent-fg)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs opacity-50">Original: {fmt(file.size)}</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setResult(null); setDlUrl(null); }} className="opacity-50 hover:opacity-100 p-2 rounded-full">
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {/* ── Step 2: Preset ── */}
        <div className="mb-5 rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">② Choose Target</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => { setPreset(p.id as PresetId); setResult(null); }}
                className="flex flex-col items-start gap-1 rounded-xl p-3 text-left border-2 transition-all"
                style={preset === p.id
                  ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: 'var(--accent-fg)' }
                  : { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--fg)' }
                }
              >
                <span className="text-lg leading-none">{p.icon}</span>
                <span className="font-bold text-xs leading-tight mt-1">{p.label}</span>
                <span className="text-[10px] opacity-70 font-mono">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Step 3: Compress ── */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4">③ Compress</p>

          {/* Progress bar */}
          {progress && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5 opacity-60">
                <span>{progress.msg}</span>
                <span>{progress.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress.pct}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          )}

          {/* Result stats */}
          {result && (
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl p-4 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              {[
                { label: 'Original',   val: fmt(result.originalBytes),   accent: false },
                { label: 'Compressed', val: fmt(result.compressedBytes),  accent: true  },
                { label: 'Saved',      val: `${result.reduction}%`,       accent: false },
                { label: 'Target',     val: result.achieved ? '✓ Met' : `${result.targetMB < 1 ? result.targetMB * 1000 + 'KB' : result.targetMB + 'MB'}`, accent: false },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-[10px] opacity-40 mb-1">{s.label}</p>
                  <p className="font-bold text-sm" style={s.accent ? { color: 'var(--accent)' } : {}}>{s.val}</p>
                </div>
              ))}
            </div>
          )}

          {!progress && sel && !result && (
            <p className="mb-4 text-xs opacity-50 flex items-center gap-1.5">
              <Zap size={12} style={{ color: 'var(--accent)' }} />
              Target: {sel.desc} · {sel.dpi} DPI · quality {Math.round(sel.quality * 100)}%
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={compress}
              disabled={!file || !preset || !!progress}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-40 hover:opacity-85"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {progress
                ? <><Loader2 className="h-4 w-4 animate-spin" />{progress.msg}</>
                : <><Zap size={15} />Compress &amp; Download</>
              }
            </button>
            {result && dlUrl && (
              <a href={dlUrl} download={`compressed-${file?.name}`}
                className="flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold border-2 hover:opacity-70"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                <FileDown size={15} />Download Again
              </a>
            )}
          </div>

          {result && !result.achieved && (
            <p className="mt-3 text-xs opacity-50 flex items-start gap-1.5">
              <AlertCircle size={11} className="shrink-0 mt-0.5" />
              Target not fully achieved — try a higher target preset, or the PDF contains high-resolution image content beyond what browser compression can reach.
            </p>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🔒', title: 'Privacy First', desc: 'No upload. Your PDF stays on your device.' },
            { icon: '🎯', title: '10 Smart Presets', desc: 'Each preset is tuned for its platform limit.' },
            { icon: '🔁', title: 'Multi-Pass Engine', desc: 'Automatically retries with lower quality to hit your target.' },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="text-xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs opacity-60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
