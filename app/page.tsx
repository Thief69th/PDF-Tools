'use client';

import React from 'react';
import { 
  FileText, 
  Merge, 
  Scissors, 
  FileSearch, 
  FileUp, 
  FileDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Search,
  Zap,
  Shield,
  Smartphone,
  LayoutGrid,
  Trash2,
  PlusSquare,
  Type,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import LiveStats from '@/components/LiveStats';
import AdBanner from '@/components/AdBanner';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const tools = [
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into one single document in seconds.',
      icon: Merge,
      href: '/tools/merge-pdf',
      category: 'PDF Tool'
    },
    {
      title: 'Split PDF',
      description: 'Extract pages from your PDF or save each page as a separate PDF.',
      icon: Scissors,
      href: '/tools/split-pdf',
      category: 'PDF Tool'
    },
    {
      title: 'PDF to Text',
      description: 'Extract all text content from your PDF documents with high accuracy.',
      icon: FileText,
      href: '/tools/pdf-to-text',
      category: 'Convert'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce the file size of your PDF while keeping the best quality.',
      icon: FileDown,
      href: '/tools/compress-pdf',
      category: 'Optimize'
    },
    {
      title: 'Image to PDF',
      description: 'Convert JPG, PNG, and other images into clean PDF documents.',
      icon: FileUp,
      href: '/tools/image-to-pdf',
      category: 'Convert'
    },
    {
      title: 'Excel to PDF',
      description: 'Convert Excel spreadsheets and CSV files into PDF tables.',
      icon: FileSpreadsheet,
      href: '/tools/excel-to-pdf',
      category: 'Convert'
    },
    {
      title: 'Delete PDF Pages',
      description: 'Remove unwanted pages from your PDF document easily.',
      icon: Trash2,
      href: '/tools/delete-pdf-pages',
      category: 'PDF Tool'
    }
  ];

  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-black dark:text-white">
          Convert & Manage PDFs Easily
        </h1>
        <p className="mt-4 text-black dark:text-white text-base sm:text-lg max-w-xl mx-auto">
          All essential PDF tools in one place. Fast. Private. Works in your browser.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tools/merge-pdf" className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold rounded-xl hover:opacity-80 transition-opacity">
            Merge PDF
          </Link>
          <Link href="/tools/compress-pdf" className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors">
            Compress PDF
          </Link>
          <Link href="/tools/image-to-pdf" className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors">
            Image to PDF
          </Link>
        </div>
        <div className="mt-6 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PDF tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <h2 className="text-2xl font-bold text-center mb-8">All PDF Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
        {filteredTools.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No tools found.</p>
        )}
      </section>

      {/* Why Choose Section */}
      <section id="about" className="max-w-5xl mx-auto px-4 pb-16 w-full">
        <h2 className="text-2xl font-bold text-center mb-8">Why Choose GENPDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: 'Fast Processing', desc: 'Lightning-fast PDF operations right in your browser.' },
            { icon: Shield, title: '100% Private', desc: 'Your files never leave your device.' },
            { icon: Smartphone, title: 'Works on All Devices', desc: 'Desktop, tablet, or phone — it just works.' },
            { icon: LayoutGrid, title: 'No Installation', desc: 'No downloads. No signups. Just open and use.' }
          ].map((feature, i) => (
            <div key={i} className="text-center p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="mb-3 flex justify-center">
                <feature.icon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-1 text-black dark:text-white">{feature.title}</h3>
              <p className="text-sm text-black dark:text-white">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="max-w-5xl mx-auto px-4 pb-16 w-full">
        <h2 className="text-2xl font-bold text-center mb-8">Latest Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'How to Merge PDFs Online', desc: 'Combine multiple PDF files into one in seconds.', icon: '📄' },
            { title: 'Compress PDFs Without Quality Loss', desc: 'Reduce file size while keeping clarity intact.', icon: '🗜️' },
            { title: 'Convert Images to PDF Easily', desc: 'Turn JPG, PNG, and more into clean PDFs.', icon: '🖼️' }
          ].map((post, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden tool-card cursor-pointer bg-white dark:bg-gray-900">
              <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-4xl">
                {post.icon}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1 text-black dark:text-white">{post.title}</h3>
                <p className="text-sm text-black dark:text-white mb-2">{post.desc}</p>
                <span className="text-sm font-medium text-indigo-600 hover:underline">Read More →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center w-full">
        <div className="p-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
          <h2 className="text-2xl font-bold mb-2">Need to work with PDFs?</h2>
          <p className="text-black dark:text-white mb-6">Explore all tools now.</p>
          <Link href="/tools" className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-80 transition-opacity text-sm">
            View All Tools
          </Link>
        </div>
      </section>

      {/* Stats Section at Bottom */}
      <section className="py-12 border-t border-white/10">
        <div className="container-custom">
          <LiveStats />
        </div>
      </section>
    </div>
  );
}
