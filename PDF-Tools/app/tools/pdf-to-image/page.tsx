'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  FileImage
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [previews, setPreviews] = useState<string[]>([]);
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
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        const arrayBuffer = await selectedFile.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
        alert('Failed to load PDF.');
      }
    }
  };

  const convertToImages = async () => {
    if (!file) return;
    setIsGenerating(true);
    setPreviews([]);

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const imageUrls: string[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 }); // High quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          const url = canvas.toDataURL('image/jpeg', 0.8);
          imageUrls.push(url);
          
          // Download each image
          const link = document.createElement('a');
          link.href = url;
          link.download = `page-${i}-${file.name.replace('.pdf', '')}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      
      setPreviews(imageUrls);
    } catch (error) {
      console.error('Error converting PDF:', error);
      alert('Failed to convert PDF to images.');
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
          <span className="">PDF to Image</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">PDF to Image</h1>
          <p className="mt-4 text-lg text-gray-600 ">
            Convert each PDF page into a high-quality JPG image instantly.
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
              <ImageIcon className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold">Select PDF File</h3>
            <p className="mt-2 text-sm text-gray-500 ">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)]  text-[var(--accent)]">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold">{file.name}</h4>
                  <p className="text-sm text-gray-500 ">{pageCount} Pages detected</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="rounded-full p-2 hover:bg-[var(--card)]  "
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={convertToImages}
                disabled={isGenerating}
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" dark:bg-[var(--card)] dark:dark:hover:bg-gray-200 sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Converting Pages...
                  </>
                ) : (
                  <>
                    <FileImage className="h-5 w-5" />
                    Convert to JPG
                  </>
                )}
              </button>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previews.map((url, i) => (
                  <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-[var(--border)] ">
                    <Image 
                      src={url} 
                      alt={`Page ${i+1}`} 
                      fill
                      unoptimized
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
                      Page {i+1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🖼️</div>
            <h3 className="mb-2 font-bold">High Quality</h3>
            <p className="text-sm text-gray-500 ">Export PDF pages as high-resolution JPG images suitable for any use.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">Private & Secure</h3>
            <p className="text-sm text-gray-500 ">Conversion happens locally. Your documents never leave your browser.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Instant Download</h3>
            <p className="text-sm text-gray-500 ">Images are generated and downloaded automatically in seconds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
