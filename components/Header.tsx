'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X, Wrench as ToolIcon, BookOpen, Info, Mail, LayoutDashboard, Sun, Moon, Coffee, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Tools', href: '/tools', icon: ToolIcon },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className={`w-full border-b border-black/5 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
        theme === 'dark' ? 'bg-black text-white/60' : 
        theme === 'warm' ? 'bg-[#eee8d5] text-black dark:text-white' : 
        'bg-gray-50 dark:bg-gray-900 text-black dark:text-white'
      }`}>
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>Your Local Time: {time || '--:--'}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Globe size={12} />
              <span>100% Local Processing</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <div className={`flex items-center gap-1 p-1 rounded-full ${
              theme === 'dark' ? 'bg-white dark:bg-gray-800/10' : 'bg-black/5'
            }`}>
              <button 
                onClick={() => setTheme('light')} 
                className={`p-1 rounded-full transition-all ${theme === 'light' ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-white hover:text-black dark:text-white dark:hover:text-white'}`}
                title="Light Mode"
              >
                <Sun size={12} />
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`p-1 rounded-full transition-all ${theme === 'dark' ? 'bg-gray-800 shadow-sm text-white' : 'text-gray-500 dark:text-white hover:text-black dark:text-white dark:hover:text-white'}`}
                title="Dark Mode"
              >
                <Moon size={12} />
              </button>
              <button 
                onClick={() => setTheme('warm')} 
                className={`p-1 rounded-full transition-all ${theme === 'warm' ? 'bg-[#e6dfc8] shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-white hover:text-black dark:text-white dark:hover:text-white'}`}
                title="Warm Mode"
              >
                <Coffee size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`w-full border-b border-white/10 backdrop-blur-md ${
        theme === 'dark' ? 'bg-gray-900/80 text-white' : 
        theme === 'warm' ? 'bg-[#fdf6e3]/80 text-black dark:text-white' : 
        'bg-white dark:bg-gray-800/80 text-black dark:text-white'
      }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex flex-col">
              <span className={`text-xl font-extrabold tracking-tight leading-none ${
                theme === 'dark' ? 'text-white' : 'text-black dark:text-white'
              }`}>GENPDF</span>
              <span className={`text-[10px] tracking-wide ${
                theme === 'dark' ? 'text-white/70' : 'text-black dark:text-white/70'
              }`}>from Oju</span>
            </Link>
          </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-bold transition-colors hover:opacity-70 ${
                theme === 'dark' ? 'text-white' : 
                theme === 'warm' ? 'text-black dark:text-white' : 
                'text-black dark:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`inline-flex items-center justify-center rounded-md p-2 focus:outline-none text-sm font-bold uppercase tracking-widest ${
              theme === 'dark' ? 'text-white hover:bg-gray-800' : 
              theme === 'warm' ? 'text-black dark:text-white hover:bg-[#eee8d5]' : 
              'text-black dark:text-white hover:bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {isOpen ? <X size={24} /> : 'Menu'}
          </button>
        </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-b border-gray-200 md:hidden ${
              theme === 'dark' ? 'bg-gray-900 text-white' : 
              theme === 'warm' ? 'bg-[#fdf6e3] text-black dark:text-white' : 
              'bg-white dark:bg-gray-800 text-black dark:text-white'
            }`}
          >
            <div className="space-y-1 px-4 pb-3 pt-2">
              {/* Mobile Time */}
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium opacity-70">
                <Clock size={16} />
                <span>Local Time: {time || '--:--'}</span>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium ${
                    theme === 'dark' ? 'hover:bg-gray-800' : 
                    theme === 'warm' ? 'hover:bg-[#eee8d5]' : 
                    'hover:bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              ))}

              {/* Mobile Theme Switcher */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
