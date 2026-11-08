import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme, activeSection, setActiveSection, sectionThemeColors } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Dynamic situational section tracking on the landing page
      if (window.location.pathname === '/') {
        const sections = ['how-it-works', 'live-demo', 'security', 'roles', 'stats'];
        const scrollPosition = window.scrollY + 140;

        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el && el.offsetTop <= scrollPosition) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      setTimeout(() => {
        scrollToSection(targetId);
      }, 200);
    }
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'LAWYER') return '/lawyer/dashboard';
    return '/client/dashboard';
  };

  const navItems = [
    { id: 'how-it-works', label: 'How It Works', color: '#6366F1' },
    { id: 'live-demo', label: 'AI Redline', color: '#10B981' },
    { id: 'security', label: 'Security', color: '#F43F5E' },
    { id: 'controls', label: 'Enterprise Controls', color: '#38BDF8', path: '/security-controls' },
    { id: 'roles', label: 'Personas', color: '#F59E0B' },
    { id: 'stats', label: 'Telemetry', color: '#06B6D4' },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const elem = document.getElementById(id);
    if (elem) {
      const navHeight = 85;
      const elementPosition = elem.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - navHeight),
        behavior: 'smooth',
      });
    }
  };

  const handleNavClick = (item, e) => {
    e.preventDefault();
    if (item.path) {
      navigate(item.path);
      setMobileMenuOpen(false);
      return;
    }

    if (window.location.pathname !== '/') {
      navigate(`/#${item.id}`);
      const tryScroll = (attempts = 0) => {
        const elem = document.getElementById(item.id);
        if (elem) {
          scrollToSection(item.id);
        } else if (attempts < 12) {
          setTimeout(() => tryScroll(attempts + 1), 80);
        }
      };
      setTimeout(() => tryScroll(0), 80);
    } else {
      scrollToSection(item.id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'glass py-3 shadow-lg shadow-black/40' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary flex items-center justify-center group-hover:shadow-glow-cyan transition-all">
            <Shield className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-accent dark:from-white dark:via-gray-100 dark:to-accent text-slate-900">
              LegalEase
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-indigo-400 border border-indigo-500/30 font-medium">
              AI Security
            </span>
          </div>
        </Link>

        {/* Desktop Navigation with Dynamic Situational Section Highlighting */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-950/40 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.path || `#${item.id}`}
                onClick={(e) => handleNavClick(item, e)}
                style={{
                  color: isActive ? item.color : undefined,
                  borderColor: isActive ? `${item.color}50` : 'transparent',
                  backgroundColor: isActive ? `${item.color}15` : 'transparent',
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'shadow-sm'
                    : 'text-slate-400 hover:text-white dark:hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {isActive && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                  />
                )}
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right CTA Actions + Theme Toggle */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Dark / Light Mode Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-900/60 dark:bg-slate-900/60 hover:bg-slate-800 text-amber-400 dark:text-amber-300 transition-all hover:scale-105 flex items-center justify-center shadow-md"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate(getDashboardPath())}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary/30 border border-primary text-xs font-medium text-white hover:bg-primary/50 transition-all shadow-glow-purple"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu and Theme toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-amber-400"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.path || `#${item.id}`}
              onClick={(e) => handleNavClick(item, e)}
              className={`block text-xs font-medium py-2 px-3 rounded-lg transition ${
                activeSection === item.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(getDashboardPath());
                }}
                className="w-full text-center py-2.5 rounded-lg bg-indigo-600 text-xs font-medium text-white"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-medium text-white border border-slate-800 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-indigo-600 text-xs font-medium text-white shadow-lg shadow-indigo-600/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
