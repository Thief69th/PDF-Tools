'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  LayoutList,
  GripVertical
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence, Reorder } from 'motion/react';

interface PageThumbnail {
  id: string;
  index: number;
  url: string;
}

export default function ReorderPagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      renderThumbnails(selectedFile);
    }
  };

  const renderThumbnails = async (pdfFile: File) => {
    setIsRendering(true);
    setThumbnails([]);
    
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const newThumbnails: PageThumbnail[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context!, viewport }).promise;
        
        newThumbnails.push({
          id: `page-${i}`,
          index: i - 1,
          url: canvas.toDataURL()
        });
      }
      
      setThumbnails(newThumbnails);
    } catch (error) {
      console.error('Error rendering thumbnails:', error);
    } finally {
      setIsRendering(false);
    }
  };

  const saveReorderedPdf = async () => {
    if (!file || thumbnails.length === 0) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();
      
      for (const thumb of thumbnails) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [thumb.index]);
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reordered-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error reordering PDF:', error);
      alert('Failed to reorder PDF. Please ensure the PDF is not protected.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span className="text-black">Reorder Pages</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-black">Reorder Pages</h1>
          <p className="mt-4 text-lg text-black">
            Drag and drop pages to rearrange your PDF document exactly how you want it.
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
              <LayoutList className="h-8 w-8 text-indigo-600" />
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
                  <p className="text-sm text-black">{thumbnails.length} Pages detected</p>
                </div>
              </div>
              <button 
                onClick={() => {setFile(null); setThumbnails([]);}}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} className="text-black" />
              </button>
            </div>

            {isRendering ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-black font-medium">Generating page previews...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <Reorder.Group 
                  axis="y" 
                  values={thumbnails} 
                  onReorder={setThumbnails}
                  className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                >
                  {thumbnails.map((thumb) => (
                    <Reorder.Item 
                      key={thumb.id} 
                      value={thumb}
                      className="group relative cursor-grab active:cursor-grabbing"
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition-all group-hover:border-black">
                        <img 
                          src={thumb.url} 
                          alt={`Page ${thumb.index + 1}`} 
                          className="h-full w-full object-contain"
                        />
                        <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                          {thumbnails.indexOf(thumb) + 1}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical size={16} className="text-black" />
                        </div>
                      </div>
                      <p className="mt-2 text-center text-[10px] font-bold text-black opacity-50 uppercase tracking-widest">
                        Original Page {thumb.index + 1}
                      </p>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                <div className="flex justify-center border-t border-gray-100 pt-10">
                  <button
                    onClick={saveReorderedPdf}
                    disabled={isGenerating || thumbnails.length === 0}
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
                        Save & Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🖱️</div>
            <h3 className="mb-2 font-bold text-black">Drag & Drop</h3>
            <p className="text-sm text-black opacity-60">Easily rearrange pages by dragging them into your preferred order.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🖼️</div>
            <h3 className="mb-2 font-bold text-black">Visual Previews</h3>
            <p className="text-sm text-black opacity-60">See high-quality thumbnails of every page to make reordering simple.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold text-black">Private & Secure</h3>
            <p className="text-sm text-black opacity-60">All page rendering and reordering happens locally in your browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
