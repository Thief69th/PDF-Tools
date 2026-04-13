'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useTheme } from './ThemeProvider';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  category: string;
}

export default function ToolCard({ title, description, icon: Icon, href, category }: ToolCardProps) {
  const { theme } = useTheme();

  const cardBg =
    theme === 'dark' ? 'bg-gray-900 border-gray-800' :
    theme === 'warm' ? 'bg-[#fdf6e3] border-[#d4c5a9]' :
    'bg-white border-gray-200';

  const iconBg =
    theme === 'dark' ? 'bg-gray-800' :
    theme === 'warm' ? 'bg-[#f0e8d0]' :
    'bg-gray-50';

  const textColor =
    theme === 'dark' ? 'text-white' :
    theme === 'warm' ? 'text-[#2c1810]' :
    'text-black';

  const hoverIcon =
    theme === 'dark'
      ? 'group-hover:bg-white group-hover:text-black'
      : theme === 'warm'
      ? 'group-hover:bg-[#2c1810] group-hover:text-[#fdf6e3]'
      : 'group-hover:bg-black group-hover:text-white';

  return (
    <Link
      href={href}
      className={`tool-card group flex flex-col p-4 rounded-xl border ${cardBg} transition-all`}
    >
      <div className={`mb-2 text-2xl flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${textColor} ${hoverIcon} transition-colors`}>
        <Icon size={20} />
      </div>
      <h3 className={`mb-1 text-sm font-semibold ${textColor}`}>{title}</h3>
      <p className={`text-xs ${textColor} opacity-70 line-clamp-2`}>{description}</p>
    </Link>
  );
}
