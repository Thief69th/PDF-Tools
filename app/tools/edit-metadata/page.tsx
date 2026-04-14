'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  ArrowRight, 
  Loader2, 
  Info,
  Settings2
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence } from 'motion/react';

export default function EditMetadataPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: ''
  });
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
        setMetadata({
          title: pdfDoc.getTitle() || '',
          author: pdfDoc.getAuthor() || '',
          subject: pdfDoc.getSubject() || '',
          keywords: pdfDoc.getKeywords() || '',
          creator: pdfDoc.getCreator() || '',
          producer: pdfDoc.getProducer() || ''
        });
      } catch (error) {
        console.error('Error reading metadata:', error);
      }
    }
  };

  const saveMetadata = async () => {
    if (!file) return;
    setIsGenerating(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      pdfDoc.setCreator(metadata.creator);
      pdfDoc.setProducer(metadata.producer);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `updated-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Failed to update metadata. Please ensure the PDF is not protected.');
    } finally {
      setIsGenerating(false);
    }
  };

  const removeMetadata = () => {
    setMetadata({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      creator: '',
      producer: ''
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
          <span className="">Edit Metadata</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl ">Edit Metadata</h1>
          <p className="mt-4 text-lg ">
            View and modify PDF properties like Title, Author, Subject, and Keywords.
          </p>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--card)]  p-12 text-center transition-all hover:border-black cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={onFileChange}
              accept="application/pdf" 
              className="hidden" 
            />
            <div className="mb-4 rounded-2xl bg-[var(--card)]  p-4 shadow-sm group-hover:scale-110 transition-transform">
              <Info className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-xl font-bold ">Select PDF File</h3>
            <p className="mt-2 text-sm ">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)]  p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card)] text-[var(--accent)]">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold ">{file.name}</h4>
                  <p className="text-sm ">Metadata loaded</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="rounded-full p-2 hover:bg-[var(--card)] "
              >
                <X size={20} className="" />
              </button>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]  p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 size={20} className="text-[var(--accent)]" />
                  <h3 className="text-lg font-bold ">Document Properties</h3>
                </div>
                <button 
                  onClick={removeMetadata}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold  mb-2">Title</label>
                    <input 
                      type="text"
                      value={metadata.title}
                      onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] "
                      placeholder="Document Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold  mb-2">Author</label>
                    <input 
                      type="text"
                      value={metadata.author}
                      onChange={(e) => setMetadata({...metadata, author: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] "
                      placeholder="Author Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold  mb-2">Subject</label>
                    <input 
                      type="text"
                      value={metadata.subject}
                      onChange={(e) => setMetadata({...metadata, subject: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] "
                      placeholder="Document Subject"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold  mb-2">Keywords (comma separated)</label>
                    <input 
                      type="text"
                      value={metadata.keywords}
                      onChange={(e) => setMetadata({...metadata, keywords: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] "
                      placeholder="keyword1, keyword2, ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold  mb-2">Creator</label>
                    <input 
                      type="text"
                      value={metadata.creator}
                      onChange={(e) => setMetadata({...metadata, creator: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] "
                      placeholder="Application Creator"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold  mb-2">Producer</label>
                    <input 
                      type="text"
                      value={metadata.producer}
                      onChange={(e) => setMetadata({...metadata, producer: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] "
                      placeholder="PDF Producer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={saveMetadata}
                  disabled={isGenerating}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:opacity-80 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--accent-fg)" }} className=" sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Update Metadata & Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-4 text-2xl">📝</div>
            <h3 className="mb-2 font-bold ">Edit Properties</h3>
            <p className="text-sm  opacity-60">Easily update Title, Author, and other internal PDF properties.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-4 text-2xl">🧹</div>
            <h3 className="mb-2 font-bold ">Remove Metadata</h3>
            <p className="text-sm  opacity-60">Clear all metadata to keep your documents clean and private.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold ">Local Only</h3>
            <p className="text-sm  opacity-60">All metadata editing happens in your browser. No files are uploaded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
