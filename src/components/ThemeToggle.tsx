'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  isFixed?: boolean;
}

export default function ThemeToggle({ className = '', isFixed = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('apparelflow-theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('apparelflow-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-lg bg-slate-800/40 border border-slate-700/50 ${
          isFixed ? 'fixed top-4 right-4 z-50' : ''
        } ${className}`}
      />
    );
  }

  const baseClasses = isFixed
    ? 'fixed top-4 right-4 z-[9999] flex items-center justify-center w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 backdrop-blur-md shadow-lg shadow-black/25 transition-all duration-300 hover:scale-105 active:scale-95'
    : 'flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all duration-200 hover:scale-105 active:scale-95';

  return (
    <button
      onClick={toggle}
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      className={`${baseClasses} ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
