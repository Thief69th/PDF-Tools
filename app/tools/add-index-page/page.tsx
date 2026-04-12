'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  LayoutList,
  Plus,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

interface IndexItem {
  id: string;
  title: string;
  page: number;
}

export default function AddIndexPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [indexTitle, setIndexTitle] = useState('Table of Contents');
  const [items, setItems] = useState<IndexItem[]>([
    { id: '1', title: 'Introduction', page: 1 }
  ]);
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

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substring(7), title: '', page: 1 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof IndexItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addIndexPage = async () => {
    if (!file) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const indexPage = pdfDoc.insertPage(0);
      const { width, height } = indexPage.getSize();
      
      // Draw Title
      indexPage.drawText(indexTitle, {
        x: 50,
        y: height - 80,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Draw Items
      let currentY = height - 130;
      items.forEach((item) => {
        indexPage.drawText(item.title, {
          x: 50,
          y: currentY,
          size: 14,
          font,
          color: rgb(0, 0, 0),
        });

        const pageText = `Page ${item.page}`;
        const pageTextWidth = font.widthOfTextAtSize(pageText, 14);
        indexPage.drawText(pageText, {
          x: width - 50 - pageTextWidth,
          y: currentY,
          size: 14,
          font,
          color: rgb(0, 0, 0),
        });

        // Draw dots
        const dotsWidth = width - 100 - font.widthOfTextAtSize(item.title, 14) - pageTextWidth - 20;
        if (dotsWidth > 0) {
          const dots = '.'.repeat(Math.floor(dotsWidth / font.widthOfTextAtSize('.', 14)));
          indexPage.drawText(dots, {
            x: 50 + font.widthOfTextAtSize(item.title, 14) + 10,
            y: currentY,
            size: 14,
            font,
            color: rgb(0, 0, 0),
          });
        }

        currentY -= 30;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `indexed-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error adding index page:', error);
      alert('Failed to add index page. Please ensure the PDF is not protected.');
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
          <span className="text-black">Add Index Page</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-black">Add Index Page</h1>
          <p className="mt-4 text-lg text-black">
            Generate a professional Table of Contents page at the beginning of your PDF.
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
                  <p className="text-sm text-black">Ready to add index</p>
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
              <div className="mb-8">
                <label className="block text-sm font-bold text-black mb-2">Index Title</label>
                <input 
                  type="text"
                  value={indexTitle}
                  onChange={(e) => setIndexTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest opacity-50">Index Items</h3>
                  <button 
                    onClick={addItem}
                    className="flex items-center gap-2 rounded-lg bg-black text-white px-3 py-1.5 text-xs font-bold hover:opacity-80"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-4"
                      >
                        <div className="flex-1">
                          <input 
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                            placeholder="Chapter or Section Title"
                            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>
                        <div className="w-24">
                          <input 
                            type="number"
                            value={item.page}
                            onChange={(e) => updateItem(item.id, 'page', parseInt(e.target.value) || 1)}
                            placeholder="Page"
                            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-12 flex justify-center">
                <button
                  onClick={addIndexPage}
                  disabled={isGenerating || items.length === 0}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Generate & Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">📖</div>
            <h3 className="mb-2 font-bold text-black">Professional Look</h3>
            <p className="text-sm text-black opacity-60">Add a clean Table of Contents to your documents for better navigation.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">✍️</div>
            <h3 className="mb-2 font-bold text-black">Fully Customizable</h3>
            <p className="text-sm text-black opacity-60">Control the title, item names, and page numbers of your index.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold text-black">Private Processing</h3>
            <p className="text-sm text-black opacity-60">All page generation happens locally in your browser. No data is uploaded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
