'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="text-lg font-extrabold">GENPDF</span>
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <ShieldCheck size={9} /> PRIVACY FIRST
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm opacity-60 mb-4">
          <Link href="/tools" className="hover:opacity-100 transition-opacity">Tools</Link>
          <Link href="/blog" className="hover:opacity-100 transition-opacity">Blog</Link>
          <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
          <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
          <Link href="/contact" className="hover:opacity-100 transition-opacity">Contact</Link>
        </div>
        <p className="text-xs opacity-30">© {year} GENPDF. No files uploaded. No data collected.</p>
      </div>
    </footer>
  );
}
