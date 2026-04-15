'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'warm' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'rose' | 'slate' | 'aurora';

export const THEMES: { id: Theme; label: string; emoji: string }[] = [
  { id: 'light',    label: 'Light',    emoji: '☀️'  },
  { id: 'dark',     label: 'Dark',     emoji: '🌙'  },
  { id: 'warm',     label: 'Warm',     emoji: '☕'  },
  { id: 'ocean',    label: 'Ocean',    emoji: '🌊'  },
  { id: 'forest',   label: 'Forest',   emoji: '🌲'  },
  { id: 'sunset',   label: 'Sunset',   emoji: '🌅'  },
  { id: 'midnight', label: 'Midnight', emoji: '🌌'  },
  { id: 'rose',     label: 'Rose',     emoji: '🌸'  },
  { id: 'slate',    label: 'Slate',    emoji: '🪨'  },
  { id: 'aurora',   label: 'Aurora',   emoji: '🌠'  },
];

const themeBg: Record<Theme, string> = {
  light:    'bg-white text-black',
  dark:     'bg-gray-900 text-white',
  warm:     'bg-[#fdf6e3] text-[#2c1810]',
  ocean:    'bg-[#0f2744] text-[#e0f0ff]',
  forest:   'bg-[#0d2818] text-[#d4edda]',
  sunset:   'bg-[#1a0a00] text-[#fde8c8]',
  midnight: 'bg-[#0a0a1a] text-[#d0d0ff]',
  rose:     'bg-[#fff0f3] text-[#4a1028]',
  slate:    'bg-[#1e293b] text-[#cbd5e1]',
  aurora:   'bg-[#0d1117] text-[#c9d1d9]',
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('pdf-theme') as Theme | null;
    if (saved && THEMES.find(t => t.id === saved)) {
      setTheme(saved);
    } else {
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 6) setTheme('warm');
      else if (hour >= 20) setTheme('dark');
      else setTheme('light');
    }
    setMounted(true);
  }, []);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('pdf-theme', newTheme);
  };

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    THEMES.forEach(t => root.classList.remove(t.id));
    root.classList.add(theme);
    const darkThemes: Theme[] = ['dark', 'ocean', 'forest', 'sunset', 'midnight', 'slate', 'aurora'];
    root.style.colorScheme = darkThemes.includes(theme) ? 'dark' : 'light';
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      <div
        className={`min-h-screen transition-colors duration-300 ${!mounted ? 'bg-white text-black' : themeBg[theme]}`}
        style={!mounted ? { colorScheme: 'light' } : {}}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) return { theme: 'light' as Theme, setTheme: () => {} };
  return context;
};
