'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Files
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

export default function MergePdfPage() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
        .filter(file => file.type === 'application/pdf')
        .map(file => ({
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          size: formatSize(file.size)
        }));
      setPdfs(prev => [...prev, ...newFiles]);
    }
  };

  const removePdf = (id: string) => {
    setPdfs(prev => prev.filter(pdf => pdf.id !== id));
  };

  const movePdf = (index: number, direction: 'up' | 'down') => {
    const newPdfs = [...pdfs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newPdfs.length) {
      [newPdfs[index], newPdfs[targetIndex]] = [newPdfs[targetIndex], newPdfs[index]];
      setPdfs(newPdfs);
    }
  };

  const mergePdfs = async () => {
    if (pdfs.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }
    setIsGenerating(true);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfFile of pdfs) {
        const pdfBytes = await pdfFile.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-genpdf.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please ensure all files are valid PDF documents.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span className="">Merge PDF</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Merge PDF</h1>
          <p className="mt-4 text-lg text-gray-600 ">
            Combine multiple PDF files into one single document in seconds.
          </p>
        </div>

        {pdfs.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border)]  bg-[var(--card)] /50 p-12 text-center transition-all hover:border-black dark:hover:border-white cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              multiple 
              accept="application/pdf" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-[var(--card)]  p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Files className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold">Select PDF Files</h3>
            <p className="mt-2 text-sm text-gray-500 ">
              Drag and drop your PDFs here, or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <AnimatePresence>
                {pdfs.map((pdf, index) => (
                  <motion.div 
                    key={pdf.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--card)]  text-[var(--accent)]">
                        <FileText size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="truncate text-sm font-bold">{pdf.name}</h4>
                        <p className="text-xs text-gray-500 ">{pdf.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col sm:flex-row gap-1">
                        <button 
                          onClick={() => movePdf(index, 'up')}
                          disabled={index === 0}
                          className="rounded-lg p-1.5 hover:bg-[var(--card)]   disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp size={16} />
                        </button>
                        <button 
                          onClick={() => movePdf(index, 'down')}
                          disabled={index === pdfs.length - 1}
                          className="rounded-lg p-1.5 hover:bg-[var(--card)]   disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removePdf(pdf.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border)]  pt-8">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm font-bold text-[var(--accent)] hover:underline"
              >
                <Plus size={18} />
                Add More Files
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={onFileChange}
                  multiple 
                  accept="application/pdf" 
                  className="hidden" 
                />
              </button>
              
              <button
                onClick={mergePdfs}
                disabled={isGenerating || pdfs.length < 2}
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" dark:bg-[var(--card)] dark:dark:hover:bg-gray-200 sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Merging PDFs...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Merge PDF
                  </>
                )}
              </button>
            </div>
            <p className="text-center text-xs text-gray-500 ">
              {pdfs.length} file{pdfs.length !== 1 ? 's' : ''} selected. All processing is 100% local.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">Secure Merging</h3>
            <p className="text-sm text-gray-500 ">Your files are merged locally in your browser. No data is sent to any server.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Instant Results</h3>
            <p className="text-sm text-gray-500 ">Combine even large PDF files in seconds without waiting for uploads.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">📑</div>
            <h3 className="mb-2 font-bold">Maintain Quality</h3>
            <p className="text-sm text-gray-500 ">The original quality of your PDF pages is preserved during the merge.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
