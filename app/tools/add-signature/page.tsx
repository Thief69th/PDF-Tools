'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  PenTool,
  Eraser,
  Upload as UploadIcon,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function AddSignaturePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signatureType, setSignatureType] = useState<'draw' | 'upload'>('draw');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(0.5);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigFileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (signatureType === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, [signatureType]);

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

  const onSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSignatureImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureImage(canvasRef.current.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.beginPath();
        setSignatureImage(null);
      }
    }
  };

  const addSignature = async () => {
    if (!file || !signatureImage) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      
      const sigImageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
      let sigImage;
      if (signatureImage.includes('image/png')) {
        sigImage = await pdfDoc.embedPng(sigImageBytes);
      } else {
        sigImage = await pdfDoc.embedJpg(sigImageBytes);
      }

      const { width, height } = page.getSize();
      const sigDims = sigImage.scale(scale);

      page.drawImage(sigImage, {
        x: (position.x / 100) * width,
        y: (position.y / 100) * height,
        width: sigDims.width,
        height: sigDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error adding signature:', error);
      alert('Failed to add signature. Please ensure the PDF is not protected.');
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
          <span className="text-black dark:text-white">Add Signature</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl text-black dark:text-white">Add Signature</h1>
          <p className="mt-4 text-lg text-black dark:text-white">
            Sign your PDF documents by drawing a signature or uploading an image.
          </p>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 dark:bg-gray-900 p-12 text-center transition-all hover:border-black cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              accept="application/pdf" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-sm group-hover:scale-110 transition-transform">
              <PenTool className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white">Select PDF File</h3>
            <p className="mt-2 text-sm text-black dark:text-white">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-black dark:text-white">{file.name}</h4>
                  <p className="text-sm text-black dark:text-white">{totalPages} Pages detected</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="rounded-full p-2 hover:bg-gray-100 dark:bg-gray-800"
              >
                <X size={20} className="text-black dark:text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Signature Creation */}
              <div className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-black dark:text-white">Create Signature</h3>
                  <div className="flex gap-2 rounded-full bg-gray-100 dark:bg-gray-800 p-1">
                    <button 
                      onClick={() => setSignatureType('draw')}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${signatureType === 'draw' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-white'}`}
                    >
                      Draw
                    </button>
                    <button 
                      onClick={() => setSignatureType('upload')}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${signatureType === 'upload' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-white'}`}
                    >
                      Upload
                    </button>
                  </div>
                </div>

                {signatureType === 'draw' ? (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:bg-gray-900 overflow-hidden aspect-[2/1]">
                      <canvas 
                        ref={canvasRef}
                        width={400}
                        height={200}
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseMove={draw}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                        className="h-full w-full cursor-crosshair touch-none"
                      />
                      {!signatureImage && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                          Draw your signature here
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={clearCanvas}
                      className="flex items-center gap-2 text-xs font-bold text-red-500 hover:underline"
                    >
                      <Eraser size={14} />
                      Clear Signature
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div 
                      onClick={() => sigFileInputRef.current?.click()}
                      className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:bg-gray-900 p-8 text-center transition-all hover:border-black cursor-pointer aspect-[2/1]"
                    >
                      <input 
                        type="file" 
                        ref={sigFileInputRef}
                        onChange={onSignatureUpload}
                        accept="image/*" 
                        className="hidden" 
                      />
                      {signatureImage ? (
                        <img src={signatureImage} alt="Signature" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <>
                          <UploadIcon className="mb-2 h-6 w-6 text-gray-400" />
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload Image</p>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-black dark:text-white opacity-50">Recommended: Transparent PNG signature.</p>
                  </div>
                )}
              </div>

              {/* Placement Settings */}
              <div className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-black dark:text-white mb-6">Placement Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-black dark:text-white mb-2">Page Number (1-{totalPages})</label>
                    <input 
                      type="number"
                      min={1}
                      max={totalPages}
                      value={pageNumber}
                      onChange={(e) => setPageNumber(Math.min(totalPages, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black text-black dark:text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">X Position (%)</label>
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
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">Y Position (%)</label>
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
                    <label className="block text-sm font-bold text-black dark:text-white mb-2">Scale ({Math.round(scale * 100)}%)</label>
                    <input 
                      type="range"
                      min={0.1}
                      max={2}
                      step={0.1}
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    onClick={addSignature}
                    disabled={isGenerating || !signatureImage}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Sign & Download PDF
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
            <h3 className="mb-2 font-bold text-black dark:text-white">Draw Signature</h3>
            <p className="text-sm text-black dark:text-white opacity-60">Use your mouse or touch screen to draw a natural-looking signature.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">📤</div>
            <h3 className="mb-2 font-bold text-black dark:text-white">Upload Image</h3>
            <p className="text-sm text-black dark:text-white opacity-60">Already have a digital signature? Upload it and place it on any page.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold text-black dark:text-white">Secure & Private</h3>
            <p className="text-sm text-black dark:text-white opacity-60">Your signature and documents are processed locally. Nothing is uploaded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
