'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Type,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

export default function PdfToTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      setExtractedText('');
    }
  };

  const extractText = async () => {
    if (!file) return;
    setIsGenerating(true);

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      
      setExtractedText(fullText);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Failed to extract text from PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.replace('.pdf', '')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <span className="">PDF to Text</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">PDF to Text</h1>
          <p className="mt-4 text-lg text-gray-600 ">
            Extract all text content from your PDF document in seconds.
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
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)]  text-[var(--accent)]">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold">{file.name}</h4>
                  <p className="text-sm text-gray-500 ">Ready to extract text</p>
                </div>
              </div>
              <button 
                onClick={() => {setFile(null); setExtractedText('');}}
                className="rounded-full p-2 hover:bg-[var(--card)]  "
              >
                <X size={20} />
              </button>
            </div>

            {!extractedText ? (
              <div className="flex justify-center">
                <button
                  onClick={extractText}
                  disabled={isGenerating}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" dark:bg-[var(--card)] dark:dark:hover:bg-gray-200 sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Extracting Text...
                    </>
                  ) : (
                    <>
                      <Type className="h-5 w-5" />
                      Extract Text
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Extracted Content</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 rounded-lg border border-[var(--border)]  px-3 py-1.5 text-xs font-bold hover:bg-[var(--card)]  "
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                    <button 
                      onClick={downloadText}
                      className="flex items-center gap-2 rounded-lg bg-black text-white dark:bg-[var(--card)] dark:px-3 py-1.5 text-xs font-bold hover:opacity-80"
                    >
                      <Download size={14} />
                      Download .txt
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-auto rounded-2xl border border-[var(--border)]  bg-[var(--card)]  p-6 text-sm leading-relaxed font-mono whitespace-pre-wrap">
                  {extractedText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">📝</div>
            <h3 className="mb-2 font-bold">Text Extraction</h3>
            <p className="text-sm text-gray-500 ">Quickly pull all readable text from your PDF documents for editing or analysis.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">Privacy First</h3>
            <p className="text-sm text-gray-500 ">Text extraction happens entirely in your browser. Your data never leaves your device.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)]  p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Fast & Free</h3>
            <p className="text-sm text-gray-500 ">No limits on file size or page count. Extract text from any PDF instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
