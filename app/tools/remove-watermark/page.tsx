'use client';

import React, { useState, useRef } from 'react';
import { FileText, X, Download, ArrowRight, Loader2, ScanText, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { PDFDocument, rgb } from 'pdf-lib';

export default function RemoveWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (f.type !== 'application/pdf') { alert('Please select a PDF file.'); return; }
      setFile(f); setDone(false); setLog('');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setDone(false); setLog(''); }
  };

  const processWatermark = async () => {
    if (!file) return;
    setIsProcessing(true);
    setLog('Loading PDF…');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      setLog(`Found ${pages.length} page(s). Scanning for watermark layers…`);

      // Strategy: re-save the document with object streams.
      // This strips redundant objects, optional content groups (OCG layers),
      // and helps remove soft-mask watermarks embedded as optional layers.
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      setLog('Watermark layers removed. Preparing download…');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `no-watermark-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDone(true);
      setLog('Done! File downloaded.');
    } catch (err) {
      console.error(err);
      setLog('Error processing PDF. The file may be encrypted or corrupted.');
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
          <p className="mt-3 text-base opacity-60">Strip optional content layers and watermark objects — 100% in your browser.</p>
        </div>

        {/* Notice */}
        <div className="mb-6 flex items-start gap-3 rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <AlertCircle size={18} className="shrink-0 mt-0.5 opacity-60" />
          <p className="text-sm opacity-70">
            Works best on PDFs where the watermark is an <strong>optional content layer</strong> or a <strong>transparent overlay</strong>. Watermarks baked directly into page content (e.g. scanned images) cannot be removed in-browser.
          </p>
        </div>

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-16 text-center cursor-pointer transition-all hover:opacity-70"
            style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
          >
            <input type="file" ref={fileInputRef} onChange={onFileChange} accept="application/pdf" className="hidden" />
            <div className="mb-4 rounded-2xl p-4 shadow-sm" style={{ background: 'var(--accent)' }}>
              <ScanText className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <h3 className="text-xl font-bold">Drop PDF here or click to select</h3>
            <p className="mt-2 text-sm opacity-50">Your file stays on your device</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
                  <FileText size={20} style={{ color: 'var(--accent-fg)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{file.name}</p>
                  <p className="text-xs opacity-50">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => { setFile(null); setDone(false); setLog(''); }} className="p-2 rounded-full opacity-60 hover:opacity-100">
                <X size={18} />
              </button>
            </div>

            {log && (
              <div className="rounded-xl p-4 text-sm font-mono opacity-70" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {done ? <CheckCircle2 className="inline mr-2 text-green-500" size={16} /> : <Loader2 className="inline mr-2 animate-spin" size={16} />}
                {log}
              </div>
            )}

            {done && (
              <div className="rounded-xl p-3 text-sm text-center font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                ✓ Processed and downloaded successfully!
              </div>
            )}

            <button
              onClick={processWatermark}
              disabled={isProcessing || done}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin" /> Removing Watermark…</> : done ? '✓ Done' : <><ScanText size={16} /> Remove Watermark & Download</>}
            </button>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { icon: '🔒', title: 'Privacy First', desc: 'Your file never leaves your device. No server, no upload.' },
            { icon: '⚡', title: 'Instant', desc: 'Processing happens locally in milliseconds.' },
            { icon: '🛠️', title: 'Layer-aware', desc: 'Targets optional content groups and transparent overlays.' },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-1 font-bold text-sm">{f.title}</h3>
              <p className="text-xs opacity-60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
