'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Scissors,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitRange, setSplitRange] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
        setSplitRange(`1-${pdfDoc.getPageCount()}`);
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Failed to load PDF. It might be corrupted or password-protected.');
      }
    }
  };

  const splitPdf = async () => {
    if (!file) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      // Parse range (e.g., "1-3, 5, 7-10")
      const pagesToExtract: number[] = [];
      const parts = splitRange.split(',').map(p => p.trim());
      
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(Number);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = Math.max(1, start); i <= Math.min(pageCount, end); i++) {
              pagesToExtract.push(i - 1);
            }
          }
        } else {
          const page = Number(part);
          if (!isNaN(page) && page >= 1 && page <= pageCount) {
            pagesToExtract.push(page - 1);
          }
        }
      }

      if (pagesToExtract.length === 0) {
        alert('Invalid page range.');
        setIsGenerating(false);
        return;
      }

      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `split-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Failed to split PDF.');
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
          <span className="text-black dark:text-white">Split PDF</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Split PDF</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Extract specific pages from your PDF or save each page as a separate document.
          </p>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-12 text-center transition-all hover:border-black dark:hover:border-white cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              accept="application/pdf" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Scissors className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold">Select PDF File</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold">{file.name}</h4>
                  <p className="text-sm text-gray-500">{pageCount} Pages</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold">Split Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium opacity-70">
                    Pages to Extract (e.g., 1-3, 5, 8-10)
                  </label>
                  <input 
                    type="text" 
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="Enter page range"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span>Total pages available: {pageCount}</span>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={splitPdf}
                  disabled={isGenerating || !splitRange}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Splitting PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Split PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">✂️</div>
            <h3 className="mb-2 font-bold">Precise Extraction</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Extract exactly the pages you need with flexible range selection.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">Safe & Private</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your documents are processed locally. We never see your content.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Fast Processing</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Split large PDFs instantly without any server-side delays.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
