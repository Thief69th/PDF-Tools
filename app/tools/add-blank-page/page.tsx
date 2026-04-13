'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  PlusSquare,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function AddBlankPagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [insertPosition, setInsertPosition] = useState<string>('end');
  const [customPosition, setCustomPosition] = useState<number>(1);
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
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Failed to load PDF.');
      }
    }
  };

  const addBlankPage = async () => {
    if (!file) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      let index = pageCount;
      if (insertPosition === 'start') {
        index = 0;
      } else if (insertPosition === 'custom') {
        index = Math.max(0, Math.min(pageCount, customPosition - 1));
      }

      pdfDoc.insertPage(index);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `added-blank-page-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error adding blank page:', error);
      alert('Failed to add blank page.');
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
          <span className="text-black dark:text-white">Add Blank Page</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Add Blank Page</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-white">
            Insert blank pages into your PDF document at any position.
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
              <PlusSquare className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold">Select PDF File</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white">
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
                  <p className="text-sm text-gray-500 dark:text-white">{pageCount} Pages</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="rounded-full p-2 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-bold">Insert Position</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button 
                  onClick={() => setInsertPosition('start')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${insertPosition === 'start' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
                >
                  <div className="text-sm font-bold">At the Start</div>
                </button>
                <button 
                  onClick={() => setInsertPosition('end')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${insertPosition === 'end' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
                >
                  <div className="text-sm font-bold">At the End</div>
                </button>
                <button 
                  onClick={() => setInsertPosition('custom')}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${insertPosition === 'custom' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
                >
                  <div className="text-sm font-bold">Custom Position</div>
                </button>
              </div>

              {insertPosition === 'custom' && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium opacity-70">
                    Insert before page number
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    max={pageCount + 1}
                    value={customPosition}
                    onChange={(e) => setCustomPosition(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={addBlankPage}
                  disabled={isGenerating}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Adding Page...
                    </>
                  ) : (
                    <>
                      <PlusSquare className="h-5 w-5" />
                      Add Blank Page
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
            <div className="mb-4 text-2xl">📄</div>
            <h3 className="mb-2 font-bold">Flexible Placement</h3>
            <p className="text-sm text-gray-500 dark:text-white">Insert blank pages exactly where you need them in your document.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">Private & Secure</h3>
            <p className="text-sm text-gray-500 dark:text-white">Your files are processed locally. We never see your content.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Instant Download</h3>
            <p className="text-sm text-gray-500 dark:text-white">Get your modified PDF instantly without any server-side delays.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
