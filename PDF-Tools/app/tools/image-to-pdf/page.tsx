'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileImage, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  width?: number;
  height?: number;
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [margin, setMargin] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => {
        const preview = URL.createObjectURL(file);
        const img = new window.Image();
        img.src = preview;
        
        const imageObj: ImageFile = {
          id: Math.random().toString(36).substring(7),
          file,
          preview
        };

        img.onload = () => {
          setImages(prev => prev.map(item => 
            item.preview === preview ? { ...item, width: img.width, height: img.height } : item
          ));
        };

        return imageObj;
      });
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
      setImages(newImages);
    }
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgData = await getImageData(img.preview);
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const imgProps = doc.getImageProperties(imgData);
        const ratio = imgProps.width / imgProps.height;
        
        let width = pageWidth - (margin * 2);
        let height = width / ratio;
        
        if (height > pageHeight - (margin * 2)) {
          height = pageHeight - (margin * 2);
          width = height * ratio;
        }
        
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        if (i > 0) doc.addPage();
        doc.addImage(imgData, 'JPEG', x, y, width, height);
      }

      doc.save('genpdf-images.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getImageData = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span className="">Image to PDF</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Image to PDF</h1>
          <p className="mt-4 text-lg text-gray-600 ">
            Convert JPG, PNG, WEBP and other images into a single PDF document. Merge multiple images or save each on a separate page.
          </p>
        </div>

        {images.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border)]  bg-[var(--card)] /50 p-12 text-center transition-all hover:border-black dark:hover:border-white cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              multiple 
              accept="image/*" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-[var(--card)]  p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold">Select Images</h3>
            <p className="mt-2 text-sm text-gray-500 ">
              Drag and drop your images here, or click to browse
            </p>
            <div className="mt-6 flex gap-2">
              <span className="rounded-full bg-gray-200  px-3 py-1 text-[10px] font-bold uppercase tracking-wider">JPG</span>
              <span className="rounded-full bg-gray-200  px-3 py-1 text-[10px] font-bold uppercase tracking-wider">PNG</span>
              <span className="rounded-full bg-gray-200  px-3 py-1 text-[10px] font-bold uppercase tracking-wider">WEBP</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Management Side */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings size={20} className="text-[var(--accent)]" />
                  Manage Images
                </h2>
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"
                >
                  <Eye size={16} />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <AnimatePresence>
                  {images.map((img, index) => (
                    <motion.div 
                      key={img.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[var(--border)]  "
                    >
                      <Image 
                        src={img.preview} 
                        alt={`Selected ${index + 1}`} 
                        fill
                        unoptimized
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => moveImage(index, 'up')}
                            disabled={index === 0}
                            className="rounded-full bg-[var(--card)]  p-2  hover:bg-[var(--card)]  disabled:opacity-50"
                          >
                            <MoveUp size={16} />
                          </button>
                          <button 
                            onClick={() => moveImage(index, 'down')}
                            disabled={index === images.length - 1}
                            className="rounded-full bg-[var(--card)]  p-2  hover:bg-[var(--card)]  disabled:opacity-50"
                          >
                            <MoveDown size={16} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                        Page {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)]  hover:border-black dark:hover:border-white transition-all"
                >
                  <Plus className="mb-2 h-6 w-6 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400">Add More</span>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={onFileChange}
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                  />
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-[var(--border)]  bg-[var(--card)] /50 space-y-4">
                <h3 className="font-bold">PDF Settings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <label className="opacity-70">Page Margin (mm)</label>
                    <span className="font-bold">{margin}mm</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={margin} 
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 pt-4">
                <button
                  onClick={generatePdf}
                  disabled={isGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" dark:bg-[var(--card)] dark:dark:hover:bg-gray-200"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Convert to PDF
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 ">
                  {images.length} image{images.length !== 1 ? 's' : ''} selected. All processing is 100% local.
                </p>
              </div>
            </div>

            {/* Preview Side */}
            <div className={`lg:col-span-5 ${showPreview ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Eye size={20} className="text-[var(--accent)]" />
                    Live Preview
                  </h2>
                  <span className="text-xs font-medium px-2 py-1 bg-[var(--card)]  text-[var(--accent)] rounded-md">
                    A4 Format
                  </span>
                </div>
                
                <div className="h-[600px] overflow-y-auto rounded-3xl border border-[var(--border)]  bg-[var(--card)] dark:bg-gray-950 p-6 space-y-8 scrollbar-hide">
                  <AnimatePresence>
                    {images.map((img, index) => (
                      <motion.div 
                        key={`preview-${img.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative aspect-[1/1.414] w-full bg-[var(--card)]  shadow-xl mx-auto flex items-center justify-center overflow-hidden"
                        style={{ padding: `${margin * 2}px` }}
                      >
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image 
                            src={img.preview} 
                            alt={`Preview ${index + 1}`} 
                            fill
                            unoptimized
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute bottom-2 right-2 text-[8px] font-bold text-gray-300">
                          PAGE {index + 1}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {images.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                      <FileImage size={48} className="opacity-20" />
                      <p className="text-sm">No images selected</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-center text-gray-400 italic">
                  * Preview is a simulation of the final PDF layout.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">Privacy First</h3>
            <p className="text-sm text-gray-500 ">Your images never leave your browser. Processing happens entirely on your device.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Fast & Free</h3>
            <p className="text-sm text-gray-500 ">Convert as many images as you want without any limits or hidden costs.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">📱</div>
            <h3 className="mb-2 font-bold">Any Device</h3>
            <p className="text-sm text-gray-500 ">Works perfectly on mobile, tablet, and desktop browsers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
