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
    <aside className="w-64 bg-[#0A0A12] border-r border-danger/20 flex flex-col justify-between h-screen fixed top-0 left-0 z-30 pt-4 pb-6">
      <div>
        {/* Brand */}
        <div className="px-6 pb-5 border-b border-white/10 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-danger/20 border border-danger/60 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-danger" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">LegalEase</h1>
            <span className="text-[11px] text-danger tracking-wider uppercase font-semibold">
              Root Admin
            </span>
          </div>
        </div>

        {/* Admin Identity */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-card border border-danger/20 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-danger/20 border border-danger/50 flex items-center justify-center text-danger font-bold text-xs">
            ADM
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
            <p className="text-[11px] text-textSecondary truncate">{user?.email}</p>
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
                  `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-danger/20 text-white border border-danger/50 shadow-glow-danger'
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

      <div className="px-4 pt-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium text-danger/80 hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Session</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
