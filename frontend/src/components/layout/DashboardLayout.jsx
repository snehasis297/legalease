import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Lock, 
  UploadCloud, 
  Search,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import NotificationBell from '../common/NotificationBell';

export const DashboardLayout = ({ 
  children, 
  portalType, 
  title, 
  badge,
  badgeIcon: BadgeIcon,
  actionButton
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Determine effective portal type
  const effectivePortal = portalType || (
    user?.role === 'ADMIN' ? 'admin' : user?.role === 'LAWYER' ? 'lawyer' : 'client'
  );

  const defaultBadge = effectivePortal === 'admin'
    ? 'Root Security Command'
    : effectivePortal === 'lawyer'
    ? 'Lawyer Verification Workspace'
    : 'Client Security Workspace';

  const DefaultIcon = effectivePortal === 'admin' ? ShieldAlert : ShieldCheck;
  const ActiveBadgeIcon = BadgeIcon || DefaultIcon;

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0">
        {effectivePortal === 'admin' ? <AdminSidebar /> : <Sidebar />}
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-50">
            {effectivePortal === 'admin' ? <AdminSidebar /> : <Sidebar />}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Properly offset with flex-1 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Dedicated Dashboard Topbar - High contrast executive theme */}
        <header className="sticky top-0 z-30 h-16 bg-[#0B0F19] border-b border-slate-800 px-3 sm:px-8 flex items-center justify-between shadow-md text-white">
          {/* Left: Mobile Toggle & Portal Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 min-w-0">
              <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border truncate ${
                effectivePortal === 'admin'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                  : effectivePortal === 'lawyer'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                  : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80'
              }`}>
                <ActiveBadgeIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{badge || defaultBadge}</span>
              </span>

              {title && (
                <span className="hidden md:inline-block text-sm font-semibold text-slate-300 truncate">
                  / {title}
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions, Theme & User status */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Quick action button (e.g. Upload Contract) if passed */}
            {actionButton}

            {/* AES-256-GCM Security Indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AES-256-GCM Active</span>
            </div>

            {/* Notification Bell with Real-Time Alerts */}
            <NotificationBell />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* User Quick Pill */}
            <div className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600/25 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 leading-tight">
                  {user?.role || 'CLIENT'}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl border border-rose-900/50 text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Body - Responsive padding and clean single scroll container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
