'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';

export default function ScreenshotToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select a valid image file (screenshot).');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const convertToPdf = async () => {
    if (!file || !preview) return;
    setIsGenerating(true);

    try {
      const img = new Image();
      img.src = preview;
      await new Promise((resolve) => (img.onload = resolve));

      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });

      pdf.addImage(preview, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`screenshot-${file.name.split('.')[0]}.pdf`);
    } catch (error) {
      console.error('Error converting screenshot:', error);
      alert('Failed to convert screenshot to PDF.');
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
          <span className="">Screenshot to PDF</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl ">Screenshot to PDF</h1>
          <p className="mt-4 text-lg ">
            Convert your captured screenshots (JPG, PNG, WebP) into high-quality PDF documents.
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
              accept="image/*" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-[var(--card)]  p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Camera className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold ">Upload Screenshot</h3>
            <p className="mt-2 text-sm ">
              Drag and drop your screenshot image here, or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)]  text-[var(--accent)]">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <h4 className="font-bold ">{file.name}</h4>
                  <p className="text-sm ">Ready to convert</p>
                </div>
              </div>
              <button 
                onClick={() => {setFile(null); setPreview(null);}}
                className="rounded-full p-2 hover:bg-[var(--card)]  "
              >
                <X size={20} className="" />
              </button>
            </div>

            <div className="rounded-3xl border border-[var(--border)]  bg-[var(--card)]  p-8 shadow-sm">
              <div className="mb-8 flex justify-center overflow-hidden rounded-2xl border border-[var(--border)]  bg-[var(--card)] dark:bg-gray-950">
                {preview && (
                  <img src={preview} alt="Screenshot Preview" className="max-h-[400px] object-contain" />
                )}
              </div>

              <div className="mb-8 space-y-2 max-w-md mx-auto">
                <label className="text-sm opacity-70 ">Compression Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setCompression(level)}
                      className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                        compression === level 
                          ? 'bg-[var(--accent)] text-white border-indigo-600' 
                          : 'bg-[var(--card)]  border-[var(--border)]  text-gray-600  hover:border-indigo-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500  mt-1 text-center">
                  {compression === 'low' && 'Best quality, larger file size.'}
                  {compression === 'medium' && 'Good balance of quality and file size.'}
                  {compression === 'high' && 'Smallest file size, lower image quality.'}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={convertToPdf}
                  disabled={isGenerating}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Convert & Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">📸</div>
            <h3 className="mb-2 font-bold ">Any Screenshot</h3>
            <p className="text-sm  opacity-60">Works with mobile screenshots, desktop captures, and web clippings.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">✨</div>
            <h3 className="mb-2 font-bold ">High Quality</h3>
            <p className="text-sm  opacity-60">Maintains the original resolution and quality of your screenshot in the PDF.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold ">100% Private</h3>
            <p className="text-sm  opacity-60">Your screenshots are processed locally. No images are ever uploaded to a server.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
