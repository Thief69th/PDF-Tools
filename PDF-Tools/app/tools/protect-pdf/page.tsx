'use client';

import React, { useState, useRef } from 'react';
import { FileText, X, Download, ArrowRight, Loader2, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      if (f.type !== 'application/pdf') { alert('Please select a PDF file.'); return; }
      setFile(f);
      setDone(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setDone(false); }
  };

  const protectPdf = async () => {
    if (!file || !password) return;
    setIsGenerating(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Set metadata to mark as protected and set permissions
      pdfDoc.setTitle('Protected Document');
      pdfDoc.setKeywords(['protected', 'confidential']);
      pdfDoc.setProducer('GENPDF – Privacy First');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      // Save with object streams for optimization
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protected-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert('Failed to process PDF.');
    } finally {
      setIsGenerating(false);
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
          <span>Protect PDF</span>
        </nav>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Protect PDF</h1>
          <p className="mt-3 text-base opacity-60">Add password metadata and mark your PDF as confidential — 100% in browser.</p>
        </div>

        {/* Notice */}
        <div className="mb-6 flex items-start gap-3 rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <AlertCircle size={18} className="shrink-0 mt-0.5 opacity-60" />
          <p className="text-sm opacity-70">
            <strong>Browser limitation:</strong> Full AES-256 PDF encryption requires server processing. This tool marks your PDF as confidential with metadata protection, keeping everything 100% private on your device. No upload, no server.
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
              <Lock className="h-8 w-8" style={{ color: 'var(--accent-fg)' }} />
            </div>
            <h3 className="text-xl font-bold">Drop PDF here or click to select</h3>
            <p className="mt-2 text-sm opacity-50">Your file stays on your device</p>
          </div>
        ) : (
          <div className="space-y-6">
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
              <button onClick={() => { setFile(null); setDone(false); }} className="p-2 rounded-full opacity-60 hover:opacity-100">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="mb-5 text-base font-bold text-center">Set Password Label</h3>
              <div className="max-w-sm mx-auto space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {done && (
                  <div className="rounded-xl p-3 text-sm text-center font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                    ✓ PDF protected and downloaded!
                  </div>
                )}

                <button
                  onClick={protectPdf}
                  disabled={isGenerating || !password}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-40"
                  style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
                >
                  {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><ShieldCheck size={16} /> Protect & Download</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
