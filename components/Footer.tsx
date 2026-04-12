import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <div className="mb-4">
          <Link href="/" className="flex flex-col items-center">
            <span className="text-lg font-extrabold text-black">GENPDF</span>
            <span className="text-[10px] text-black tracking-wide">from Oju</span>
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-black mb-6">
          <Link href="/tools" className="hover:opacity-70 transition-colors">Tools</Link>
          <Link href="/blog" className="hover:opacity-70 transition-colors">Blog</Link>
          <Link href="/privacy" className="hover:opacity-70 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:opacity-70 transition-colors">Terms</Link>
          <Link href="/contact" className="hover:opacity-70 transition-colors">Contact</Link>
        </div>
        <p className="text-xs text-black opacity-50">© {currentYear} GENPDF. All rights reserved.</p>
      </div>
    </footer>
  );
}
