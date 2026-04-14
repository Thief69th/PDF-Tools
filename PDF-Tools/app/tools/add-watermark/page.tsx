'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Type,
  Layout,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function AddWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotation, setRotation] = useState<number>(45);
  const [fontSize, setFontSize] = useState<number>(50);
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

  const addWatermark = async () => {
    if (!file || !watermarkText) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Draw the watermark text
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * fontSize * 0.3),
          y: height / 2,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacity,
          rotate: degrees(rotation),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error adding watermark:', error);
      alert('Failed to add watermark.');
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
          <span className="">Add Watermark</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Add Watermark</h1>
          <p className="mt-4 text-lg text-gray-600 ">
            Protect your PDF documents with custom text watermarks.
          </p>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border)]  bg-[var(--card)] /50 p-12 text-center transition-all hover:border-black dark:hover:border-white cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              accept="application/pdf" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-[var(--card)]  p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Type className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold">Select PDF File</h3>
            <p className="mt-2 text-sm text-gray-500 ">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)]  text-[var(--accent)]">
                    <FileText size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold truncate">{file.name}</h4>
                    <p className="text-sm text-gray-500 ">{pageCount} Pages</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="rounded-full p-2 hover:bg-[var(--card)]  "
                >
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Settings size={20} className="text-[var(--accent)]" />
                  Watermark Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium opacity-70">Watermark Text</label>
                    <input 
                      type="text" 
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border)]  bg-[var(--card)]  px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] "
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium opacity-70">Font Size ({fontSize})</label>
                      <input 
                        type="range" 
                        min="10"
                        max="200"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium opacity-70">Rotation ({rotation}°)</label>
                      <input 
                        type="range" 
                        min="-180"
                        max="180"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium opacity-70">Opacity ({Math.round(opacity * 100)}%)</label>
                    <input 
                      type="range" 
                      min="0"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={addWatermark}
                    disabled={isGenerating || !watermarkText}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" dark:bg-[var(--card)] dark:dark:hover:bg-gray-200"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Adding Watermark...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        Add Watermark & Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Layout size={20} className="text-[var(--accent)]" />
                  Preview
                </h3>
                <div className="relative aspect-[1/1.414] w-full bg-[var(--card)]  shadow-xl border border-[var(--border)]  rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div 
                      style={{ 
                        fontSize: `${fontSize * 0.5}px`, 
                        opacity: opacity,
                        transform: `rotate(${rotation}deg)`,
                        color: '#888',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      {watermarkText}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Page Content Simulation</div>
                </div>
                <p className="text-[10px] text-center text-gray-400 italic">
                  * Preview is a simulation of the watermark placement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🛡️</div>
            <h3 className="mb-2 font-bold">Protect Content</h3>
            <p className="text-sm text-gray-500 ">Prevent unauthorized use of your documents by adding visible watermarks.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🎨</div>
            <h3 className="mb-2 font-bold">Customizable</h3>
            <p className="text-sm text-gray-500 ">Adjust text, size, rotation, and transparency to fit your needs perfectly.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Fast Processing</h3>
            <p className="text-sm text-gray-500 ">Apply watermarks to all pages of your PDF instantly in your browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
