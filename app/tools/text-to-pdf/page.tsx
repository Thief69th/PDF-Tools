'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  ArrowRight, 
  Loader2, 
  Image as ImageIcon,
  Plus,
  Trash2,
  Type
} from 'lucide-react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';

interface AttachedImage {
  id: string;
  preview: string;
  file: File;
}

export default function TextToPdfPage() {
  const [text, setText] = useState('');
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      }));
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

  const generatePdf = async () => {
    if (!text && images.length === 0) {
      alert('Please enter some text or add images.');
      return;
    }
    
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      let yOffset = 20;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - (margin * 2);

      // Add Text
      if (text) {
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < splitText.length; i++) {
          if (yOffset > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
          }
          doc.text(splitText[i], margin, yOffset);
          yOffset += 7; // Line height
        }
        yOffset += 10; // Spacing after text
      }

      // Add Images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgData = await getImageData(img.preview);
        
        const imgProps = doc.getImageProperties(imgData);
        const ratio = imgProps.width / imgProps.height;
        
        let width = maxWidth;
        let height = width / ratio;
        
        // If image is taller than a page, scale it down
        if (height > pageHeight - (margin * 2)) {
          height = pageHeight - (margin * 2);
          width = height * ratio;
        }

        // Check if we need a new page for the image
        if (yOffset + height > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }
        
        const xOffset = margin + (maxWidth - width) / 2; // Center image
        
        doc.addImage(imgData, 'JPEG', xOffset, yOffset, width, height);
        yOffset += height + 10; // Spacing after image
      }

      doc.save('document.pdf');
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
      <div className="mx-auto max-w-4xl">
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span className="">Text to PDF</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl ">Text to PDF</h1>
          <p className="mt-4 text-lg ">
            Convert text and multiple images into a clean PDF document.
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl border border-[var(--border)]  bg-[var(--card)]  p-6 shadow-sm space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold  mb-2">
                <Type size={16} />
                Document Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full min-h-[300px] p-4 rounded-xl border border-[var(--border)]   focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none resize-y "
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-bold ">
                  <ImageIcon size={16} />
                  Attached Images
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm font-bold text-[var(--accent)] hover:text-indigo-700"
                >
                  <Plus size={16} />
                  Add Images
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={onFileChange}
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {images.map((img) => (
                      <motion.div
                        key={img.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] group"
                      >
                        <img src={img.preview} alt="Attached" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeImage(img.id)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={generatePdf}
              disabled={isGenerating || (!text && images.length === 0)}
              className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
