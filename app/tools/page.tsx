'use client';

import React from 'react';
import {
  FileText, Merge, Scissors, FileDown, FileUp, Lock, Unlock,
  Image as ImageIcon, Trash2, PlusSquare, Type, FileSpreadsheet,
  ScanText, Hash, PenTool, QrCode, LayoutList, MousePointer2,
  Camera, BookOpen, List, FileEdit, RotateCcw, AlignLeft, FileImage, Sparkles
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';

const categories = [
  {
    name: 'Organize',
    tools: [
      { title: 'Merge PDF',      description: 'Combine multiple PDFs into one document.',  icon: Merge,         href: '/tools/merge-pdf' },
      { title: 'Split PDF',      description: 'Extract pages or split into files.',         icon: Scissors,      href: '/tools/split-pdf' },
      { title: 'Reorder Pages',  description: 'Drag & drop to rearrange PDF pages.',        icon: RotateCcw,     href: '/tools/reorder-pages' },
      { title: 'Delete Pages',   description: 'Remove unwanted pages from PDF.',            icon: Trash2,        href: '/tools/delete-pdf-pages' },
      { title: 'Add PDF Page',   description: 'Insert pages from another PDF.',             icon: PlusSquare,    href: '/tools/add-pdf-page' },
      { title: 'Add Blank Page', description: 'Insert blank pages into your PDF.',          icon: PlusSquare,    href: '/tools/add-blank-page' },
    ]
  },
  {
    name: 'Edit',
    tools: [
      { title: 'Add Text',         description: 'Place custom text anywhere on pages.',        icon: MousePointer2, href: '/tools/add-text' },
      { title: 'Add Page Numbers', description: 'Add page numbers with custom positioning.',   icon: Hash,          href: '/tools/add-page-numbers' },
      { title: 'Add Watermark',    description: 'Add text watermarks to PDF pages.',           icon: Type,          href: '/tools/add-watermark' },
      { title: 'Add Signature',    description: 'Sign PDFs with drawn or typed signatures.',   icon: PenTool,       href: '/tools/add-signature' },
      { title: 'Add QR Code',      description: 'Embed QR codes into PDF documents.',          icon: QrCode,        href: '/tools/add-qr-code' },
      { title: 'Add Index Page',   description: 'Auto-generate a table of contents.',          icon: BookOpen,      href: '/tools/add-index-page' },
      { title: 'Edit Metadata',    description: 'Change title, author, PDF properties.',       icon: FileEdit,      href: '/tools/edit-metadata' },
      { title: 'Remove Watermark', description: 'Strip watermark layers from PDFs.',           icon: ScanText,      href: '/tools/remove-watermark' },
    ]
  },
  {
    name: 'Security & Optimize',
    tools: [
      { title: 'Protect PDF',  description: 'Add password protection to your PDF.',   icon: Lock,     href: '/tools/protect-pdf' },
      { title: 'Unlock PDF',   description: 'Remove password from protected PDFs.',   icon: Unlock,   href: '/tools/unlock-pdf' },
      { title: 'Compress PDF', description: 'Reduce size with 10 smart presets.',     icon: FileDown, href: '/tools/compress-pdf' },
    ]
  },
  {
    name: 'Convert from PDF',
    ai: false,
    tools: [
      { title: 'PDF to Text',  description: 'Extract all text from PDF documents.', icon: FileText,       href: '/tools/pdf-to-text',  ai: false },
      { title: 'PDF to Image', description: 'Save PDF pages as PNG/JPG images.',    icon: FileImage,      href: '/tools/pdf-to-image', ai: false },
      { title: 'PDF to Word',  description: 'Convert PDF to editable Word doc.',    icon: FileText,       href: '/tools/pdf-to-word',  ai: true },
      { title: 'PDF to Excel', description: 'Extract tables into Excel spreadsheet.',icon: FileSpreadsheet,href: '/tools/pdf-to-excel', ai: true },
    ]
  },
  {
    name: 'Convert to PDF',
    tools: [
      { title: 'Image to PDF',      description: 'Convert JPG, PNG images to PDF.',       icon: ImageIcon,      href: '/tools/image-to-pdf' },
      { title: 'Screenshot to PDF', description: 'Convert screenshots to PDF.',            icon: Camera,         href: '/tools/screenshot-to-pdf' },
      { title: 'Excel to PDF',      description: 'Convert Excel/CSV files to PDF tables.', icon: FileSpreadsheet,href: '/tools/excel-to-pdf' },
      { title: 'Text to PDF',       description: 'Convert plain text into a PDF.',         icon: AlignLeft,      href: '/tools/text-to-pdf' },
    ]
  },
  {
    name: 'Create',
    tools: [
      { title: 'Resume Builder', description: 'Build a professional resume as PDF.', icon: List, href: '/tools/resume-builder' },
    ]
  },
];

export default function ToolsPage() {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-xl text-center mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">All PDF Tools</h1>
        <p className="mt-3 opacity-60">Every tool runs in your browser. No uploads. No server. Privacy first.</p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          <Sparkles size={11} /> PDF to Word &amp; PDF to Excel — Powered by Claude AI
        </div>
      </div>

      <div className="space-y-14">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-bold shrink-0">{cat.name}</h2>
              <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {cat.tools.map((tool) => (
                <div key={tool.title} className="relative">
                  {(tool as any).ai && (
                    <div className="absolute -top-1.5 -right-1.5 z-10 flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                      <Sparkles size={8} /> AI
                    </div>
                  )}
                  <ToolCard {...tool} category={cat.name} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
