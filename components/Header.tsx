'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ShieldCheck, ChevronDown } from 'lucide-react';
import { useTheme, THEMES, Theme } from './ThemeProvider';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const current = THEMES.find(t => t.id === theme) || THEMES[0];

  const navItems = [
    { name: 'Tools', href: '/tools' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Dynamic colors from CSS vars
  const headerStyle: React.CSSProperties = {
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    color: 'var(--fg)',
  };
  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    color: 'var(--fg)',
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md" style={headerStyle}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--fg)' }}>GENPDF</span>
          <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: 'var(--accent-fg)', opacity: 0.9 }}>
            <ShieldCheck size={9} />
            PRIVACY FIRST
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold transition-opacity hover:opacity-60"
              style={{ color: 'var(--fg)' }}
            >
              {item.name}
            </Link>
          ))}

          {/* Theme Picker */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={cardStyle}
            >
              <span>{current.emoji}</span>
              <span>{current.label}</span>
              <ChevronDown size={13} />
            </button>

            {themeOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-44 rounded-xl shadow-xl p-1.5 z-50 grid grid-cols-2 gap-1"
                style={cardStyle}
              >
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id as Theme); setThemeOpen(false); }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-60 text-left"
                    style={theme === t.id ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { color: 'var(--fg)' }}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-sm font-bold px-3 py-1.5 rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
          style={cardStyle}
        >
          {isOpen ? <X size={18} /> : 'Menu'}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1" style={headerStyle}>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold"
              style={{ color: 'var(--fg)' }}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs px-3 pb-1 opacity-50 font-bold" style={{ color: 'var(--muted)' }}>Theme</p>
            <div className="grid grid-cols-5 gap-1 px-1">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id as Theme); setIsOpen(false); }}
                  title={t.label}
                  className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-xs"
                  style={theme === t.id ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : { color: 'var(--fg)' }}
                >
                  <span>{t.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close theme dropdown */}
      {themeOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setThemeOpen(false)} />
      )}
    </header>
  );
}
