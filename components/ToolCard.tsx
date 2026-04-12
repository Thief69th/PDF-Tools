'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

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
      className="tool-card group flex flex-col p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 transition-all"
    >
      <div className="mb-2 text-2xl flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
        <Icon size={20} />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-black">{title}</h3>
      <p className="text-xs text-black line-clamp-2">{description}</p>
    </Link>
  );
}
