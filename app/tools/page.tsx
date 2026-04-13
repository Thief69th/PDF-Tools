'use client';

import React from 'react';
import { 
  FileText, 
  Merge, 
  Scissors, 
  FileDown, 
  FileUp, 
  Lock, 
  Unlock,
  Image as ImageIcon, 
  Database, 
  Cpu, 
  Globe,
  Trash2,
  PlusSquare,
  Type,
  FileSpreadsheet,
  X,
  Hash,
  Info,
  PenTool,
  QrCode,
  LayoutList,
  MousePointer2,
  Layers,
  Camera
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import AdBanner from '@/components/AdBanner';

export default function ToolsPage() {
  const categories = [
    {
      name: 'Organize PDF',
      tools: [
        { title: 'Merge PDF', description: 'Combine multiple PDF files into one single document.', icon: Merge, href: '/tools/merge-pdf' },
        { title: 'Split PDF', description: 'Extract pages from your PDF or save each page as a separate PDF.', icon: Scissors, href: '/tools/split-pdf' },
        { title: 'Reorder Pages', description: 'Drag and drop to rearrange the pages of your PDF.', icon: LayoutList, href: '/tools/reorder-pages' },
        { title: 'Delete PDF Pages', description: 'Remove unwanted pages from your PDF document.', icon: Trash2, href: '/tools/delete-pdf-pages' },
        { title: 'Add PDF Page', description: 'Insert pages from one PDF into another document.', icon: PlusSquare, href: '/tools/add-pdf-page' },
        { title: 'Add Blank Page', description: 'Insert blank pages into your PDF document.', icon: PlusSquare, href: '/tools/add-blank-page' },
        { title: 'Add Index Page', description: 'Generate a Table of Contents page for your PDF.', icon: LayoutList, href: '/tools/add-index-page' },
      ]
    },
    {
      name: 'Edit PDF',
      tools: [
        { title: 'Add Custom Text', description: 'Type and place custom text anywhere on your PDF pages.', icon: MousePointer2, href: '/tools/add-text' },
        { title: 'Add Page Numbers', description: 'Add page numbers to your PDF with custom positioning.', icon: Hash, href: '/tools/add-page-numbers' },
        { title: 'Add Watermark', description: 'Add custom text watermarks to your PDF pages.', icon: Type, href: '/tools/add-watermark' },
        { title: 'Add Signature', description: 'Sign your PDF documents with a drawn or uploaded signature.', icon: PenTool, href: '/tools/add-signature' },
        { title: 'Add QR Code', description: 'Generate and add QR codes to your PDF documents.', icon: QrCode, href: '/tools/add-qr-code' },
        { title: 'Remove Watermark', description: 'Information about removing watermarks from PDF.', icon: X, href: '/tools/remove-watermark' },
      ]
    },
    {
      name: 'Security & Metadata',
      tools: [
        { title: 'Protect PDF', description: 'Encrypt your PDF with a password and set permissions.', icon: Lock, href: '/tools/protect-pdf' },
        { title: 'Unlock PDF', description: 'Remove password protection and restrictions from your PDF.', icon: Unlock, href: '/tools/unlock-pdf' },
        { title: 'Edit Metadata', description: 'Change PDF properties like Title, Author, and Keywords.', icon: Info, href: '/tools/edit-metadata' },
        { title: 'Compress PDF', description: 'Reduce the file size of your PDF while keeping the best quality.', icon: FileDown, href: '/tools/compress-pdf' },
      ]
    },
    {
      name: 'Convert from PDF',
      tools: [
        { title: 'PDF to Text', description: 'Extract all text content from your PDF.', icon: FileText, href: '/tools/pdf-to-text' },
        { title: 'PDF to Image', description: 'Extract images or save each page as a JPG.', icon: ImageIcon, href: '/tools/pdf-to-image' },
        { title: 'PDF to Word', description: 'Convert PDF to editable Word documents (Coming Soon).', icon: FileText, href: '/tools/pdf-to-text' },
        { title: 'PDF to Excel', description: 'Convert PDF tables to Excel spreadsheets (Coming Soon).', icon: Database, href: '/tools/pdf-to-text' },
      ]
    },
    {
      name: 'Convert to PDF',
      tools: [
        { title: 'Image to PDF', description: 'Convert images (JPG, PNG, WebP) to PDF documents.', icon: ImageIcon, href: '/tools/image-to-pdf' },
        { title: 'Screenshot to PDF', description: 'Convert your screenshots into high-quality PDF documents.', icon: Camera, href: '/tools/screenshot-to-pdf' },
        { title: 'Excel to PDF', description: 'Convert Excel spreadsheets to PDF.', icon: FileSpreadsheet, href: '/tools/excel-to-pdf' },
        { title: 'Word to PDF', description: 'Convert Word documents to PDF (Coming Soon).', icon: FileUp, href: '/tools/image-to-pdf' },
        { title: 'HTML to PDF', description: 'Convert web pages to PDF documents (Coming Soon).', icon: Globe, href: '/tools/image-to-pdf' },
      ]
    }
  ];

  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">All Online Tools</h1>
        <p className="mt-4 text-lg text-black dark:text-white">
          Browse our complete collection of free online tools designed to make your work easier.
        </p>
      </div>

      <div className="mt-12">
        <AdBanner slot="tools-top" />
      </div>

      <div className="mt-20 space-y-20">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white">{category.name}</h2>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {category.tools.map((tool) => (
                <ToolCard key={tool.title} {...tool} category={category.name} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <AdBanner slot="tools-bottom" />
      </div>
    </div>
  );
}
