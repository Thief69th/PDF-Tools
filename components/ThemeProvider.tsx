'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'warm';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    if (isManual) return () => clearTimeout(timer);

    const updateTheme = () => {
      const hour = new Date().getHours();
      
      // Warm mode: 10 PM - 6 AM
      if (hour >= 22 || hour < 6) {
        setTheme('warm');
      } 
      // Dark mode: 8 PM - 10 PM (Night mode)
      else if (hour >= 20) {
        setTheme('dark');
      } 
      // Light mode: 6 AM - 8 PM
      else {
        setTheme('light');
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [isManual]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsManual(true);
  };

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'warm');
    root.classList.add(theme);
    
    if (theme === 'dark') {
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      <div 
        className={`min-h-screen transition-colors duration-500 ${
          !mounted ? 'bg-white text-black' :
          theme === 'dark' ? 'bg-gray-900 text-white' : 
          theme === 'warm' ? 'bg-[#fdf6e3] text-[#2c1810]' : 
          'bg-white text-black'
        }`}
        style={!mounted ? { colorScheme: 'light' } : {}}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return a fallback if used outside provider (e.g. during static generation)
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
    };
  }
  return context;
}
