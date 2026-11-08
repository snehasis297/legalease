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
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800 flex flex-col justify-between h-screen fixed top-0 left-0 z-30 pt-4 pb-6 shadow-xl text-white">
      <div>
        {/* Brand */}
        <div className="px-6 pb-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">LegalEase</h1>
            <span className={`text-[11px] tracking-wider uppercase font-semibold ${isLawyer ? 'text-amber-400' : 'text-indigo-400'}`}>
              {isLawyer ? 'Lawyer Portal' : 'Client Portal'}
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3 shadow-md">
          <div className="w-10 h-10 rounded-full bg-indigo-600/25 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
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
                      ? isLawyer
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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
      <div className="px-4 pt-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
