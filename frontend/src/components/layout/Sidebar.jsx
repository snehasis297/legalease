import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  User,
  ShieldCheck,
  Award,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isLawyer = user?.role === 'LAWYER';

  const clientLinks = [
    { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/client/upload', label: 'Upload Contract', icon: UploadCloud },
    { to: '/client/documents', label: 'My Documents', icon: FileText },
    { to: '/client/profile', label: 'Profile', icon: User },
    { to: '/client/security', label: 'Security & Sessions', icon: ShieldCheck },
  ];

  const lawyerLinks = [
    { to: '/lawyer/dashboard', label: 'Lawyer Dashboard', icon: LayoutDashboard },
    { to: '/lawyer/documents', label: 'Assigned Contracts', icon: FileText },
    { to: '/lawyer/kyc/status', label: 'Verification Status', icon: Award },
    { to: '/lawyer/profile', label: 'Profile & Credentials', icon: User },
  ];

  const links = isLawyer ? lawyerLinks : clientLinks;

  return (
    <aside className="w-64 bg-[#0F0F1A] border-r border-white/10 flex flex-col justify-between h-screen fixed top-0 left-0 z-30 pt-4 pb-6">
      <div>
        {/* Brand */}
        <div className="px-6 pb-6 border-b border-white/10 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">LegalEase</h1>
            <span className="text-[11px] text-accent tracking-wider uppercase font-semibold">
              {isLawyer ? 'Lawyer Portal' : 'Client Portal'}
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-card border border-white/5 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/30 border border-primary/60 flex items-center justify-center text-white font-semibold">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-textSecondary truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1.5 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-glow-purple'
                      : 'text-textSecondary hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="px-4 pt-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-danger/80 hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
