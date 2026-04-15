'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Unlock,
  Lock,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function UnlockPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const unlockPdf = async () => {
    if (!file) return;
    setIsGenerating(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let pdfDoc;
      
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, { password });
      } catch (e: any) {
        if (e.message.includes('password')) {
          setError('Incorrect password. Please try again.');
          setIsGenerating(false);
          return;
        }
        throw e;
      }

      // To remove password, we just save the document without encryption
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `unlocked-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error unlocking PDF:', error);
      setError('Failed to unlock PDF. The file might be corrupted or use unsupported encryption.');
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
          <span className="">Unlock PDF</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl ">Unlock PDF</h1>
          <p className="mt-4 text-lg ">
            Remove passwords and restrictions from your PDF files to edit and share them freely.
          </p>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--card)]  p-12 text-center transition-all hover:border-black cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              accept="application/pdf" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-[var(--card)]  p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Unlock className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold ">Select PDF File</h3>
            <p className="mt-2 text-sm ">
              Drag and drop your locked PDF here, or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)]  p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)] text-[var(--accent)]">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold ">{file.name}</h4>
                  <p className="text-sm ">Enter password to unlock</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="rounded-full p-2 hover:bg-[var(--card)] "
              >
                <X size={20} className="" />
              </button>
            </div>

            <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)]  p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-[var(--card)] p-4 text-[var(--accent)]">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold ">Password Required</h3>
                <p className="mt-2 text-sm  opacity-60">
                  This PDF is encrypted. Please enter the password to remove protection.
                </p>
              </div>

              <div className="space-y-4">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password"
                  className="w-full rounded-xl border border-[var(--border)] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] "
                />
                
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    <ShieldAlert size={16} />
                    {error}
                  </div>
                )}

                <button
                  onClick={unlockPdf}
                  disabled={isGenerating || !password}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=""
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-5 w-5" />
                      Unlock & Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-4 text-2xl">🔓</div>
            <h3 className="mb-2 font-bold ">Remove Passwords</h3>
            <p className="text-sm  opacity-60">Instantly remove owner passwords and open passwords from your PDF documents.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-4 text-2xl">✂️</div>
            <h3 className="mb-2 font-bold ">Remove Restrictions</h3>
            <p className="text-sm  opacity-60">Unlock restricted actions like printing, copying text, or modifying the document.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold ">100% Private</h3>
            <p className="text-sm  opacity-60">Password processing happens locally in your browser. We never see your passwords or files.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
