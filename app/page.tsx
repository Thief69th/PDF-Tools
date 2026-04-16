'use client';

import React from 'react';
import {
  FileText, Merge, Scissors, FileDown, FileUp,
  Image as ImageIcon, Trash2, PlusSquare, Type, FileSpreadsheet,
  ScanText, Hash, PenTool, QrCode, RotateCcw, AlignLeft, FileImage,
  MousePointer2, BookOpen, List, FileEdit, Camera, Search, Zap, Shield,
  Smartphone, LayoutGrid, Sparkles, Tablet, Columns
} from 'lucide-react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const tools = [
    // Organize
    { title: 'Merge PDF',         description: 'Combine multiple PDFs into one document.',        icon: Merge,          href: '/tools/merge-pdf',         category: 'Organize' },
    { title: 'Split PDF',         description: 'Extract pages or split into separate files.',     icon: Scissors,       href: '/tools/split-pdf',         category: 'Organize' },
    { title: 'Reorder Pages',     description: 'Drag & drop to rearrange PDF pages.',             icon: RotateCcw,      href: '/tools/reorder-pages',     category: 'Organize' },
    { title: 'Delete Pages',      description: 'Remove unwanted pages from your PDF.',            icon: Trash2,         href: '/tools/delete-pdf-pages',  category: 'Organize' },
    { title: 'Add PDF Page',      description: 'Insert pages from another PDF.',                  icon: PlusSquare,     href: '/tools/add-pdf-page',      category: 'Organize' },
    { title: 'Add Blank Page',    description: 'Insert blank pages into your PDF.',               icon: PlusSquare,     href: '/tools/add-blank-page',    category: 'Organize' },
    // Edit
    { title: 'Add Text',          description: 'Place custom text anywhere on PDF pages.',        icon: MousePointer2,  href: '/tools/add-text',          category: 'Edit' },
    { title: 'Add Page Numbers',  description: 'Add page numbers with custom positioning.',       icon: Hash,           href: '/tools/add-page-numbers',  category: 'Edit' },
    { title: 'Add Watermark',     description: 'Add text watermarks to PDF pages.',               icon: Type,           href: '/tools/add-watermark',     category: 'Edit' },
    { title: 'Add Signature',     description: 'Sign your PDFs with drawn or typed signatures.', icon: PenTool,        href: '/tools/add-signature',     category: 'Edit' },
    { title: 'Add QR Code',       description: 'Embed QR codes into PDF documents.',              icon: QrCode,         href: '/tools/add-qr-code',       category: 'Edit' },
    { title: 'Add Index Page',    description: 'Auto-generate a table of contents.',              icon: BookOpen,       href: '/tools/add-index-page',    category: 'Edit' },
    { title: 'Edit Metadata',     description: 'Change title, author, and PDF properties.',       icon: FileEdit,       href: '/tools/edit-metadata',     category: 'Edit' },
    { title: 'Remove Watermark',  description: 'Strip watermark layers from PDFs.',               icon: ScanText,       href: '/tools/remove-watermark',  category: 'Edit' },
    // Optimize
    { title: 'Compress PDF',      description: 'Reduce file size — 10 smart presets.',            icon: FileDown,       href: '/tools/compress-pdf',      category: 'Optimize' },
    // Kindle
    { title: 'PDF to EPUB',       description: 'Convert PDF to EPUB for Kindle & e-readers.',    icon: BookOpen,       href: '/tools/pdf-to-epub',       category: 'Kindle', ai: true },
    { title: 'PDF for Kindle',    description: 'Resize PDF to exact Kindle screen dimensions.',   icon: Tablet,         href: '/tools/pdf-for-kindle',    category: 'Kindle' },
    { title: 'Split PDF Columns', description: 'Split 2-3 column PDFs into Kindle pages.',       icon: Columns,        href: '/tools/pdf-split-columns', category: 'Kindle' },
    // Convert from PDF
    { title: 'PDF to Text',       description: 'Extract all text from PDF documents.',            icon: FileText,       href: '/tools/pdf-to-text',       category: 'Convert' },
    { title: 'PDF to Image',      description: 'Save PDF pages as PNG/JPG images.',               icon: FileImage,      href: '/tools/pdf-to-image',      category: 'Convert' },
    { title: 'PDF to Word',       description: 'Convert PDF to editable Word doc with AI.',       icon: FileText,       href: '/tools/pdf-to-word',       category: 'Convert', ai: true },
    { title: 'PDF to Excel',      description: 'Extract tables from PDF into Excel.',             icon: FileSpreadsheet,href: '/tools/pdf-to-excel',      category: 'Convert', ai: true },
    // Convert to PDF
    { title: 'Image to PDF',      description: 'Convert JPG, PNG images to PDF.',                 icon: ImageIcon,      href: '/tools/image-to-pdf',      category: 'Convert' },
    { title: 'Screenshot to PDF', description: 'Convert screenshots to PDF.',                     icon: Camera,         href: '/tools/screenshot-to-pdf', category: 'Convert' },
    { title: 'Excel to PDF',      description: 'Convert Excel/CSV files to PDF tables.',          icon: FileSpreadsheet,href: '/tools/excel-to-pdf',      category: 'Convert' },
    { title: 'Text to PDF',       description: 'Convert plain text into a PDF document.',         icon: AlignLeft,      href: '/tools/text-to-pdf',       category: 'Convert' },
    // Create
    { title: 'Resume Builder',    description: 'Build a professional resume as PDF.',             icon: List,           href: '/tools/resume-builder',    category: 'Create' },
  ];

  const filtered = tools.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <section className="max-w-2xl mx-auto px-4 pt-14 pb-10 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          PDF Tools that work in your browser
        </h1>
        <p className="mt-4 text-base sm:text-lg opacity-60 max-w-lg mx-auto">
          Fast. Private. No uploads. No server. Your files never leave your device.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-bold opacity-60">
          <span className="flex items-center gap-1"><Sparkles size={10} /> PDF to EPUB · PDF to Word · PDF to Excel — Claude AI</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Tablet size={10} /> 3 Kindle tools</span>
        </div>
        <div className="mt-7 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              placeholder="Search 27 PDF tools…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl focus:outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {filtered.map((tool) => (
            <div key={tool.title} className="relative">
              {(tool as any).ai && (
                <div className="absolute -top-1.5 -right-1.5 z-10 flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                  <Sparkles size={8} /> AI
                </div>
              )}
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center opacity-40 mt-8">No tools found for "{searchQuery}"</p>
        )}
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Zap,        title: 'Instant',    desc: 'Results in seconds.' },
            { icon: Shield,     title: 'Private',    desc: 'Files stay on your device.' },
            { icon: Smartphone, title: 'Any Device', desc: 'Desktop, tablet, or phone.' },
            { icon: LayoutGrid, title: 'No Install', desc: 'No downloads. No signups.' },
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
