import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Suspended = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-card max-w-lg w-full p-8 rounded-2xl border border-danger/50 shadow-glow-danger text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-danger/20 border border-danger/40 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-9 h-9 text-danger animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Account Suspended</h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            This account has been suspended due to a severe security violation (such as duplicate government ID submission or malicious file upload).
          </p>
        </div>

        {user?.disableReason && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger text-left font-mono">
            Violation: {user.disableReason}
          </div>
        )}

        <p className="text-xs text-textSecondary">
          If you believe this suspension was made in error, please prepare certified identification and contact our cybersecurity review team directly.
        </p>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <a href="mailto:legalease.systemsupport@gmail.com" className="text-accent underline font-mono">
            legalease.systemsupport@gmail.com
          </a>
          <button onClick={logout} className="text-danger hover:underline font-medium">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Suspended;
