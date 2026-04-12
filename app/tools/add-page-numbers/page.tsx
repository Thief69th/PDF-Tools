'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Hash,
  Settings2
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function AddPageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [format, setFormat] = useState('Page {n}');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const addPageNumbers = async () => {
    if (!file) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 10;

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const text = format.replace('{n}', (index + startNumber).toString()).replace('{total}', pages.length.toString());
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        
        let x = width / 2 - textWidth / 2;
        let y = 20;

        if (position === 'bottom-left') x = 30;
        if (position === 'bottom-right') x = width - textWidth - 30;
        if (position === 'top-center') y = height - 30;
        if (position === 'top-left') { x = 30; y = height - 30; }
        if (position === 'top-right') { x = width - textWidth - 30; y = height - 30; }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `numbered-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error adding page numbers:', error);
      alert('Failed to add page numbers. Please ensure the PDF is not protected.');
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
          <span className="text-black">Add Page Numbers</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-black">Add Page Numbers</h1>
          <p className="mt-4 text-lg text-black">
            Number your PDF pages automatically with custom formatting and positioning.
          </p>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center transition-all hover:border-black cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              accept="application/pdf" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Hash className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-black">Select PDF File</h3>
            <p className="mt-2 text-sm text-black">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-black">{file.name}</h4>
                  <p className="text-sm text-black">Ready to add numbers</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} className="text-black" />
              </button>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Settings2 size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-black">Numbering Settings</h3>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Position</label>
                    <select 
                      value={position}
                      onChange={(e) => setPosition(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black"
                    >
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Start Number</label>
                    <input 
                      type="number"
                      value={startNumber}
                      onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Format</label>
                    <input 
                      type="text"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      placeholder="e.g. Page {n}"
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                    <p className="mt-2 text-[10px] text-black opacity-60">
                      Use <code className="font-bold">{'{n}'}</code> for page number and <code className="font-bold">{'{total}'}</code> for total pages.
                    </p>
                  </div>
                  
                  <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                    <p className="text-xs font-bold text-black mb-2 uppercase tracking-widest opacity-50">Preview</p>
                    <p className="text-sm font-mono text-black">
                      {format.replace('{n}', startNumber.toString()).replace('{total}', '10')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={addPageNumbers}
                  disabled={isGenerating}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Add Numbers & Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🔢</div>
            <h3 className="mb-2 font-bold text-black">Auto Numbering</h3>
            <p className="text-sm text-black opacity-60">Automatically add sequential numbers to every page of your document.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🎨</div>
            <h3 className="mb-2 font-bold text-black">Custom Format</h3>
            <p className="text-sm text-black opacity-60">Choose your own text format, starting number, and position on the page.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold text-black">100% Private</h3>
            <p className="text-sm text-black opacity-60">Your files are processed locally in your browser. No data ever leaves your device.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
