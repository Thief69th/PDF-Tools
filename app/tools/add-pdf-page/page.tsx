'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  PlusCircle,
  CheckCircle2,
  Files
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function AddPdfPagePage() {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mainPageCount, setMainPageCount] = useState<number>(0);
  const [sourcePageCount, setSourcePageCount] = useState<number>(0);
  const [insertPosition, setInsertPosition] = useState<string>('end');
  const [customPosition, setCustomPosition] = useState<number>(1);
  const [pagesToInsert, setPagesToInsert] = useState<string>('all');
  
  const mainInputRef = useRef<HTMLInputElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  const onMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setMainFile(selectedFile);
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setMainPageCount(pdfDoc.getPageCount());
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }
  };

  const onSourceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setSourceFile(selectedFile);
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setSourcePageCount(pdfDoc.getPageCount());
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }
  };

  const addPages = async () => {
    if (!mainFile || !sourceFile) return;
    setIsGenerating(true);

    try {
      const mainBuffer = await mainFile.arrayBuffer();
      const sourceBuffer = await sourceFile.arrayBuffer();
      
      const mainDoc = await PDFDocument.load(mainBuffer);
      const sourceDoc = await PDFDocument.load(sourceBuffer);
      
      // Determine which pages to copy from source
      let sourceIndices: number[] = [];
      if (pagesToInsert === 'all') {
        sourceIndices = sourceDoc.getPageIndices();
      } else {
        const parts = pagesToInsert.split(',').map(p => p.trim());
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = Math.max(1, start); i <= Math.min(sourcePageCount, end); i++) {
              sourceIndices.push(i - 1);
            }
          } else {
            const page = Number(part);
            if (page >= 1 && page <= sourcePageCount) sourceIndices.push(page - 1);
          }
        }
      }

      if (sourceIndices.length === 0) {
        alert('No valid pages to insert.');
        setIsGenerating(false);
        return;
      }

      const copiedPages = await mainDoc.copyPages(sourceDoc, sourceIndices);
      
      let index = mainPageCount;
      if (insertPosition === 'start') {
        index = 0;
      } else if (insertPosition === 'custom') {
        index = Math.max(0, Math.min(mainPageCount, customPosition - 1));
      }

      for (let i = 0; i < copiedPages.length; i++) {
        mainDoc.insertPage(index + i, copiedPages[i]);
      }

      const pdfBytes = await mainDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `updated-${mainFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error adding pages:', error);
      alert('Failed to add pages.');
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
          <span className="text-black dark:text-white">Add PDF Page</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Add PDF Page</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Insert pages from one PDF into another at any specific position.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main PDF */}
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              Target PDF
            </h3>
            {!mainFile ? (
              <div 
                onClick={() => mainInputRef.current?.click()}
                className="h-48 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6 text-center cursor-pointer hover:border-black dark:hover:border-white transition-all"
              >
                <input type="file" ref={mainInputRef} onChange={onMainFileChange} accept="application/pdf" className="hidden" />
                <PlusCircle className="mb-2 h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium">Select Target PDF</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                <div className="truncate pr-4">
                  <div className="font-bold truncate text-sm">{mainFile.name}</div>
                  <div className="text-xs text-gray-500">{mainPageCount} Pages</div>
                </div>
                <button onClick={() => setMainFile(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Source PDF */}
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Files size={18} className="text-indigo-600" />
              Source PDF (Pages to add)
            </h3>
            {!sourceFile ? (
              <div 
                onClick={() => sourceInputRef.current?.click()}
                className="h-48 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6 text-center cursor-pointer hover:border-black dark:hover:border-white transition-all"
              >
                <input type="file" ref={sourceInputRef} onChange={onSourceFileChange} accept="application/pdf" className="hidden" />
                <PlusCircle className="mb-2 h-6 w-6 text-gray-400" />
                <span className="text-sm font-medium">Select Source PDF</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                <div className="truncate pr-4">
                  <div className="font-bold truncate text-sm">{sourceFile.name}</div>
                  <div className="text-xs text-gray-500">{sourcePageCount} Pages</div>
                </div>
                <button onClick={() => setSourceFile(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {mainFile && sourceFile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider opacity-50">Insertion Point</h4>
                <div className="flex flex-col gap-2">
                  {['start', 'end', 'custom'].map((pos) => (
                    <button 
                      key={pos}
                      onClick={() => setInsertPosition(pos)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium text-left transition-all ${insertPosition === pos ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-600'}`}
                    >
                      {pos === 'start' ? 'At the Start' : pos === 'end' ? 'At the End' : 'Custom Position'}
                    </button>
                  ))}
                </div>
                {insertPosition === 'custom' && (
                  <div className="pt-2">
                    <label className="text-xs font-medium opacity-70 mb-1 block">Insert before page:</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={mainPageCount + 1} 
                      value={customPosition} 
                      onChange={(e) => setCustomPosition(parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider opacity-50">Pages to Copy</h4>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setPagesToInsert('all')}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium text-left transition-all ${pagesToInsert === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-600'}`}
                  >
                    All Pages
                  </button>
                  <button 
                    onClick={() => setPagesToInsert('')}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium text-left transition-all ${pagesToInsert !== 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-600'}`}
                  >
                    Select Pages
                  </button>
                </div>
                {pagesToInsert !== 'all' && (
                  <div className="pt-2">
                    <label className="text-xs font-medium opacity-70 mb-1 block">Page numbers (e.g. 1, 3-5):</label>
                    <input 
                      type="text" 
                      value={pagesToInsert} 
                      onChange={(e) => setPagesToInsert(e.target.value)}
                      placeholder="e.g. 1, 3-4"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={addPages}
                disabled={isGenerating}
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Add Pages & Download
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">📑</div>
            <h3 className="mb-2 font-bold">Precise Control</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose exactly which pages to add and where they should go in your document.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">100% Private</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your files are processed locally in your browser. We never upload them.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Fast & Free</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">No limits on file size or page count. Works instantly on any device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
