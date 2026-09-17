import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'LAWYER') return '/lawyer/dashboard';
    return '/client/dashboard';
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
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-accent">
              LegalEase
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/30 text-accent border border-primary/50 font-medium">
              AI Security
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-textSecondary hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-textSecondary hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#security" className="text-sm font-medium text-textSecondary hover:text-white transition-colors">
            Security
          </a>
          <a href="#roles" className="text-sm font-medium text-textSecondary hover:text-white transition-colors">
            Roles
          </a>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate(getDashboardPath())}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary/30 border border-primary text-sm font-medium text-white hover:bg-primary/50 transition-all shadow-glow-purple"
              >
                <LayoutDashboard className="w-4 h-4 text-accent" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl border border-white/10 text-textSecondary hover:text-danger hover:border-danger/40 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-textSecondary hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-light text-sm font-medium text-white shadow-glow-purple transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-textSecondary hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-white/10 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-textSecondary hover:text-white py-2"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-textSecondary hover:text-white py-2"
          >
            How It Works
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-textSecondary hover:text-white py-2"
          >
            Security
          </a>
          <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getDashboardPath());
                  }}
                  className="w-full text-center py-2.5 rounded-lg bg-primary text-sm font-medium text-white"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2 text-sm font-medium text-danger"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white border border-white/10 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-primary text-sm font-medium text-white shadow-glow-purple"
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
