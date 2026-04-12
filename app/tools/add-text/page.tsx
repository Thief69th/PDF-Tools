'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  MousePointer2,
  Settings2,
  Check,
  Type
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function AddCustomTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [text, setText] = useState('Enter your text here');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState('#000000');
  
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
        setTotalPages(pdfDoc.getPageCount());
      } catch (error) {
        console.error('Error reading PDF:', error);
      }
    }
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  const addText = async () => {
    if (!file || !text) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const { width, height } = page.getSize();

      page.drawText(text, {
        x: (position.x / 100) * width,
        y: (position.y / 100) * height,
        size: fontSize,
        font,
        color: hexToRgb(color),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error adding text:', error);
      alert('Failed to add text. Please ensure the PDF is not protected.');
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
          <span className="text-black">Add Custom Text</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-black">Add Custom Text</h1>
          <p className="mt-4 text-lg text-black">
            Type and place custom text anywhere on your PDF pages with full control over style.
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
              <MousePointer2 className="h-8 w-8 text-indigo-600" />
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
                  <p className="text-sm text-black">{totalPages} Pages detected</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} className="text-black" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Text Content */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-black mb-6">Text Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Your Text</label>
                    <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black h-32 resize-none"
                      placeholder="Enter the text you want to add..."
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-black mb-2">Font Size</label>
                      <input 
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                        className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Color</label>
                      <input 
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-11 w-20 rounded-xl border border-gray-200 p-1 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Placement Settings */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                  <Settings2 size={20} className="text-indigo-600" />
                  <h3 className="text-lg font-bold text-black">Placement Settings</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Page Number (1-{totalPages})</label>
                    <input 
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageNumber}
                      onChange={(e) => setPageNumber(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">X Position (%)</label>
                      <input 
                        type="range"
                        min={0}
                        max={100}
                        value={position.x}
                        onChange={(e) => setPosition({...position, x: parseInt(e.target.value)})}
                        className="w-full accent-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black mb-2">Y Position (%)</label>
                      <input 
                        type="range"
                        min={0}
                        max={100}
                        value={position.y}
                        onChange={(e) => setPosition({...position, y: parseInt(e.target.value)})}
                        className="w-full accent-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={addText}
                    disabled={isGenerating || !text}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Adding Text...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Add Text & Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">✍️</div>
            <h3 className="mb-2 font-bold text-black">Custom Annotations</h3>
            <p className="text-sm text-black opacity-60">Add notes, headers, or any custom text to your PDF pages easily.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🎨</div>
            <h3 className="mb-2 font-bold text-black">Full Control</h3>
            <p className="text-sm text-black opacity-60">Adjust font size, color, and position to match your document&apos;s style.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold text-black">Private Processing</h3>
            <p className="text-sm text-black opacity-60">All text rendering happens locally in your browser. No data is uploaded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
