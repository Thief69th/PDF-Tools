'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: string;
}

export default function ToolCard({ title, description, icon: Icon, href, category }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="tool-card group flex flex-col p-4 rounded-xl transition-all"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--fg)' }}
    >
      <div
        className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:opacity-80"
        style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
      >
        <Icon size={20} />
      </div>
      <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--fg)' }}>{title}</h3>
      <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>{description}</p>
    </Link>
  );
}
