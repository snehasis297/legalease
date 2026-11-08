import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Award,
  FileCheck2,
  FileText,
  Activity,
  Ban,
  HelpCircle,
  KeyRound,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = () => {
  const { user, logout } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/verification-queue', label: 'Lawyer Queue', icon: Award },
    { to: '/admin/documents', label: 'All Documents', icon: FileCheck2 },
    { to: '/admin/audit-logs', label: 'Audit Trail', icon: FileText },
    { to: '/admin/suspicious', label: 'Threat Intel', icon: Activity },
    { to: '/admin/ip-blacklist', label: 'IP Blacklist', icon: Ban },
    { to: '/admin/appeals', label: 'Account Appeals', icon: HelpCircle },
    { to: '/admin/setup-2fa', label: 'Setup TOTP 2FA', icon: KeyRound },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800 flex flex-col justify-between h-screen fixed top-0 left-0 z-30 pt-4 pb-6 shadow-xl text-white">
      <div>
        {/* Brand */}
        <div className="px-6 pb-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">LegalEase</h1>
            <span className="text-[11px] text-rose-400 tracking-wider uppercase font-bold">
              Root Admin
            </span>
          </div>
        </div>

        {/* Admin Identity */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-3 shadow-md">
          <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold text-xs shrink-0">
            ADM
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Links */}
        <nav className="px-3 space-y-1 mt-2">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-bold'
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

      <div className="px-4 pt-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Session</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
