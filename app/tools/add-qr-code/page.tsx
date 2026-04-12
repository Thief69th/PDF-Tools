'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  QrCode as QrIcon,
  Settings2,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';

export default function AddQrCodePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrText, setQrText] = useState('https://genpdf.ojulabs.com');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [position, setPosition] = useState({ x: 80, y: 5 });
  const [scale, setScale] = useState(0.5);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQrCode = React.useCallback(async () => {
    try {
      const url = await QRCode.toDataURL(qrText, {
        margin: 1,
        width: 400,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrImage(url);
    } catch (err) {
      console.error(err);
    }
  }, [qrText]);

  useEffect(() => {
    if (qrText) {
      generateQrCode();
    }
  }, [qrText, generateQrCode]);

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

  const addQrCode = async () => {
    if (!file || !qrImage) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      
      const qrImageBytes = await fetch(qrImage).then(res => res.arrayBuffer());
      const qrImageEmbed = await pdfDoc.embedPng(qrImageBytes);

      const { width, height } = page.getSize();
      const qrDims = qrImageEmbed.scale(scale);

      page.drawImage(qrImageEmbed, {
        x: (position.x / 100) * width,
        y: (position.y / 100) * height,
        width: qrDims.width,
        height: qrDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error adding QR code:', error);
      alert('Failed to add QR code. Please ensure the PDF is not protected.');
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
          <span className="text-black">Add QR Code</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-black">Add QR Code</h1>
          <p className="mt-4 text-lg text-black">
            Generate and place QR codes on your PDF documents for easy link sharing.
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
              <QrIcon className="h-8 w-8 text-indigo-600" />
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
              {/* QR Content */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-black mb-6">QR Code Content</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Text or URL</label>
                    <textarea 
                      value={qrText}
                      onChange={(e) => setQrText(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black h-32 resize-none"
                      placeholder="Enter the URL or text for the QR code..."
                    />
                  </div>
                  <div className="flex justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {qrImage ? (
                      <img src={qrImage} alt="QR Preview" className="h-40 w-40 object-contain" />
                    ) : (
                      <div className="h-40 w-40 flex items-center justify-center text-gray-400">
                        <Loader2 className="animate-spin" />
                      </div>
                    )}
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

                  <div>
                    <label className="block text-sm font-bold text-black mb-2">Scale ({Math.round(scale * 100)}%)</label>
                    <input 
                      type="range"
                      min={0.1}
                      max={1.5}
                      step={0.1}
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={addQrCode}
                    disabled={isGenerating || !qrImage}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Adding QR...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Add QR & Download PDF
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
            <div className="mb-4 text-2xl">🔗</div>
            <h3 className="mb-2 font-bold text-black">Link Sharing</h3>
            <p className="text-sm text-black opacity-60">Add QR codes to your documents so readers can quickly access websites or digital content.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">📍</div>
            <h3 className="mb-2 font-bold text-black">Precise Placement</h3>
            <p className="text-sm text-black opacity-60">Place the QR code on any page and adjust its position and size with precision.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold text-black">Private Processing</h3>
            <p className="text-sm text-black opacity-60">QR generation and PDF embedding happen entirely in your browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
