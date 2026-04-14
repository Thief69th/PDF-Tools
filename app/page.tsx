'use client';

import React from 'react';
import {
  FileText, Merge, Scissors, FileSearch, FileUp, FileDown,
  Search, Zap, Shield, Smartphone, LayoutGrid, Trash2, PlusSquare,
  Type, FileSpreadsheet, Lock, Unlock, PenTool, Hash, Image,
  AlignLeft, Layers, List, QrCode, ScanText, FileEdit, BookOpen,
  RotateCcw, Camera, FileImage
} from 'lucide-react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const tools = [
    { title: 'Merge PDF', description: 'Combine multiple PDFs into one document.', icon: Merge, href: '/tools/merge-pdf', category: 'PDF Tool' },
    { title: 'Split PDF', description: 'Extract pages or split PDF into separate files.', icon: Scissors, href: '/tools/split-pdf', category: 'PDF Tool' },
    { title: 'PDF to Text', description: 'Extract all text content from PDF documents.', icon: FileText, href: '/tools/pdf-to-text', category: 'Convert' },
    { title: 'Compress PDF', description: 'Reduce PDF file size while keeping quality.', icon: FileDown, href: '/tools/compress-pdf', category: 'Optimize' },
    { title: 'Image to PDF', description: 'Convert JPG, PNG images into clean PDFs.', icon: FileUp, href: '/tools/image-to-pdf', category: 'Convert' },
    { title: 'Excel to PDF', description: 'Convert Excel and CSV files into PDF tables.', icon: FileSpreadsheet, href: '/tools/excel-to-pdf', category: 'Convert' },
    { title: 'Delete Pages', description: 'Remove unwanted pages from your PDF.', icon: Trash2, href: '/tools/delete-pdf-pages', category: 'PDF Tool' },
    { title: 'Add Page Numbers', description: 'Add custom page numbers to any PDF.', icon: Hash, href: '/tools/add-page-numbers', category: 'Edit' },
    { title: 'Add Watermark', description: 'Add text or image watermarks to PDFs.', icon: PenTool, href: '/tools/add-watermark', category: 'Edit' },
    { title: 'Add Signature', description: 'Draw or type a signature on your PDF.', icon: FileEdit, href: '/tools/add-signature', category: 'Edit' },
    { title: 'Add Text', description: 'Add custom text anywhere on your PDF pages.', icon: Type, href: '/tools/add-text', category: 'Edit' },
    { title: 'Add QR Code', description: 'Embed QR codes into your PDF documents.', icon: QrCode, href: '/tools/add-qr-code', category: 'Edit' },
    { title: 'Add Blank Page', description: 'Insert blank pages into your PDF.', icon: PlusSquare, href: '/tools/add-blank-page', category: 'PDF Tool' },
    { title: 'Add PDF Page', description: 'Insert pages from another PDF into yours.', icon: Layers, href: '/tools/add-pdf-page', category: 'PDF Tool' },
    { title: 'Reorder Pages', description: 'Drag and drop to rearrange PDF pages.', icon: RotateCcw, href: '/tools/reorder-pages', category: 'PDF Tool' },
    { title: 'Protect PDF', description: 'Add password protection to your PDF.', icon: Lock, href: '/tools/protect-pdf', category: 'Security' },
    { title: 'Unlock PDF', description: 'Remove password from protected PDFs.', icon: Unlock, href: '/tools/unlock-pdf', category: 'Security' },
    { title: 'Edit Metadata', description: 'Edit title, author, and PDF properties.', icon: FileSearch, href: '/tools/edit-metadata', category: 'Edit' },
    { title: 'PDF to Image', description: 'Convert PDF pages to PNG or JPG images.', icon: FileImage, href: '/tools/pdf-to-image', category: 'Convert' },
    { title: 'Text to PDF', description: 'Convert plain text into a PDF document.', icon: AlignLeft, href: '/tools/text-to-pdf', category: 'Convert' },
    { title: 'Screenshot to PDF', description: 'Convert screenshots into PDF documents.', icon: Camera, href: '/tools/screenshot-to-pdf', category: 'Convert' },
    { title: 'Add Index Page', description: 'Auto-generate a table of contents.', icon: BookOpen, href: '/tools/add-index-page', category: 'Edit' },
    { title: 'Resume Builder', description: 'Build a professional resume as PDF.', icon: List, href: '/tools/resume-builder', category: 'Create' },
    { title: 'Remove Watermark', description: 'Remove watermarks from PDF files.', icon: ScanText, href: '/tools/remove-watermark', category: 'Edit' },
  ];

  const filtered = tools.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-4 pt-14 pb-10 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          PDF Tools that work in your browser
        </h1>
        <p className="mt-4 text-base sm:text-lg opacity-60 max-w-lg mx-auto">
          Fast. Private. No uploads. No server. Your files never leave your device.
        </p>
        <div className="mt-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              placeholder="Search PDF tools…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl focus:outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            />
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center opacity-40 mt-8">No tools found for "{searchQuery}"</p>
        )}
      </section>

      {/* Why Section */}
      <section className="max-w-4xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: 'Instant', desc: 'Results in seconds, right in your browser.' },
            { icon: Shield, title: 'Private', desc: 'Files never leave your device.' },
            { icon: Smartphone, title: 'Any Device', desc: 'Works on desktop, tablet, or phone.' },
            { icon: LayoutGrid, title: 'No Install', desc: 'No downloads. No signups. Just use it.' },
          ].map((f, i) => (
            <div key={i} className="text-center p-5 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="mb-3 flex justify-center">
                <f.icon className="h-7 w-7" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs opacity-60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
