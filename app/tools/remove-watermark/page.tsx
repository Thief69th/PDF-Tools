'use client';

import React from 'react';
import { 
  FileText, 
  ArrowRight, 
  ShieldAlert,
  Info,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function RemoveWatermarkPage() {
  return (
    <div className="container-custom py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-medium opacity-50">
          <Link href="/" className="hover:underline">Home</Link>
          <ArrowRight size={14} />
          <Link href="/tools" className="hover:underline">Tools</Link>
          <ArrowRight size={14} />
          <span className="text-black dark:text-white">Remove Watermark</span>
        </nav>

        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Remove PDF Watermark</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-white">
            Information about removing watermarks from PDF documents.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 md:p-12 shadow-sm space-y-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
              <ShieldAlert size={32} />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Technical Limitations</h2>
              <p className="text-gray-600 dark:text-white leading-relaxed">
                Removing a watermark from a PDF is a complex task. Unlike adding a layer, a watermark is often &quot;baked&quot; into the document&apos;s content stream, making it indistinguishable from the actual text or images.
              </p>
              <p className="text-gray-600 dark:text-white leading-relaxed">
                To ensure 100% privacy and security, our tools run entirely in your browser. Currently, browser-based PDF libraries do not support the advanced content analysis required to safely identify and remove watermarks without damaging the rest of the document.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Info size={18} className="text-indigo-600" />
              Recommended Alternatives
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-white">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>PDF to Text:</strong> If you only need the text content, use our <Link href="/tools/pdf-to-text" className="text-indigo-600 hover:underline">PDF to Text</Link> tool. Watermarks are often ignored during text extraction.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>PDF to Word:</strong> Converting to Word (Coming Soon) often allows you to manually select and delete watermark objects.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span><strong>OCR Tools:</strong> Use advanced OCR software if the watermark is part of a scanned image.</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-white italic">We are working on advanced browser-based algorithms to support this in the future.</p>
            <Link href="/tools" className="flex items-center gap-2 font-bold text-indigo-600 hover:underline">
              Explore other tools
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">🔒</div>
            <h3 className="mb-2 font-bold">Privacy First</h3>
            <p className="text-sm text-gray-500 dark:text-white">We prioritize your data security by never uploading your files to any server.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">⚡</div>
            <h3 className="mb-2 font-bold">Local Processing</h3>
            <p className="text-sm text-gray-500 dark:text-white">All operations are performed on your device for maximum speed and privacy.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="mb-4 text-2xl">🛠️</div>
            <h3 className="mb-2 font-bold">Constant Updates</h3>
            <p className="text-sm text-gray-500 dark:text-white">We are constantly adding new features and improving our local PDF processing engine.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
