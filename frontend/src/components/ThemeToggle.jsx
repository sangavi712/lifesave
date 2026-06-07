import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white dark:border-slate-700/60 transition-all duration-300 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      aria-label="Toggle theme"
      type="button"
    >
      {theme === 'light' ? (
        <Moon size={17} className="transition-transform hover:rotate-12 duration-300" />
      ) : (
        <Sun size={17} className="text-amber-400 transition-transform hover:rotate-45 duration-500" />
      )}
    </button>
  );
};
