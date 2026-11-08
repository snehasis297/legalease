import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  activeSection: 'hero',
  setActiveSection: () => {},
  sectionThemeColors: {},
});

export const SECTION_THEMES = {
  hero: {
    id: 'hero',
    name: 'Neural Engine',
    color: '#3B82F6',
    tailwind: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderClass: 'border-blue-500/50',
    glowClass: 'shadow-[0_0_45px_rgba(59,130,246,0.22)]',
    gradientClass: 'from-blue-900/30 via-transparent to-transparent',
  },
  'how-it-works': {
    id: 'how-it-works',
    name: 'Workflow Pipeline',
    color: '#6366F1',
    tailwind: 'indigo',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderClass: 'border-indigo-500/50',
    glowClass: 'shadow-[0_0_45px_rgba(99,102,241,0.25)]',
    gradientClass: 'from-indigo-900/35 via-transparent to-transparent',
  },
  'live-demo': {
    id: 'live-demo',
    name: 'AI Neural Redlining',
    color: '#10B981',
    tailwind: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/50',
    glowClass: 'shadow-[0_0_45px_rgba(16,185,129,0.25)]',
    gradientClass: 'from-emerald-900/35 via-transparent to-transparent',
  },
  security: {
    id: 'security',
    name: 'Zero-Knowledge Cryptography',
    color: '#F43F5E',
    tailwind: 'rose',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderClass: 'border-rose-500/50',
    glowClass: 'shadow-[0_0_45px_rgba(244,63,94,0.28)]',
    gradientClass: 'from-rose-900/35 via-transparent to-transparent',
  },
  roles: {
    id: 'roles',
    name: 'Multi-Persona Governance',
    color: '#F59E0B',
    tailwind: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-500/50',
    glowClass: 'shadow-[0_0_45px_rgba(245,158,11,0.25)]',
    gradientClass: 'from-amber-900/35 via-transparent to-transparent',
  },
  stats: {
    id: 'stats',
    name: 'Enterprise Telemetry',
    color: '#06B6D4',
    tailwind: 'cyan',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderClass: 'border-cyan-500/50',
    glowClass: 'shadow-[0_0_45px_rgba(6,182,212,0.25)]',
    gradientClass: 'from-cyan-900/35 via-transparent to-transparent',
  },
  cta: {
    id: 'cta',
    name: 'Smart Launchpad',
    color: '#A855F7',
    tailwind: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderClass: 'border-purple-500/50',
    glowClass: 'shadow-[0_0_45px_rgba(168,85,247,0.25)]',
    gradientClass: 'from-purple-900/35 via-transparent to-transparent',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('legalease_theme') || 'dark';
  });

  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('legalease_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      const navOffset = 85;
      const elementPosition = elem.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth',
      });
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        activeSection,
        setActiveSection,
        scrollToSection,
        sectionThemeColors: SECTION_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
