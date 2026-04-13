'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  const textColor =
    theme === 'dark' ? 'text-white' :
    theme === 'warm' ? 'text-[#2c1810]' :
    'text-black';

  const borderColor =
    theme === 'dark' ? 'border-gray-800' :
    theme === 'warm' ? 'border-[#d4c5a9]' :
    'border-gray-200';

  const bgColor =
    theme === 'dark' ? 'bg-gray-950' :
    theme === 'warm' ? 'bg-[#f5edd8]' :
    'bg-gray-50';

  return (
    <footer id="contact" className={`border-t ${borderColor} ${bgColor}`}>
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <div className="mb-4">
          <Link href="/" className="flex flex-col items-center">
            <span className={`text-lg font-extrabold ${textColor}`}>GENPDF</span>
            <span className={`text-[10px] ${textColor} tracking-wide`}>from Oju</span>
          </Link>
        </div>
        <div className={`flex flex-wrap justify-center gap-4 text-sm ${textColor} mb-6`}>
          <Link href="/tools" className="hover:opacity-70 transition-colors">Tools</Link>
          <Link href="/blog" className="hover:opacity-70 transition-colors">Blog</Link>
          <Link href="/privacy" className="hover:opacity-70 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:opacity-70 transition-colors">Terms</Link>
          <Link href="/contact" className="hover:opacity-70 transition-colors">Contact</Link>
        </div>
        <p className={`text-xs ${textColor} opacity-50`}>© {currentYear} GENPDF. All rights reserved.</p>
      </div>
    </footer>
  );
}
