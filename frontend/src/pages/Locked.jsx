import React from 'react';
import { Lock, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Locked = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-card max-w-lg w-full p-8 rounded-2xl border border-danger/40 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-danger/20 border border-danger/40 flex items-center justify-center mx-auto">
          <Lock className="w-9 h-9 text-danger" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Account Temporarily Locked</h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            Your account was locked after 10 consecutive failed login attempts to safeguard against unauthorized brute-force breaches.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 flex items-center space-x-3 text-left">
          <Clock className="w-5 h-5 text-accent flex-shrink-0" />
          <p className="text-xs text-textSecondary">
            Your account will <strong className="text-white">automatically unlock after 30 minutes</strong>. Alternatively, you can reset your password immediately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/forgot-password"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-semibold shadow-glow-purple transition-all"
          >
            Reset Password Now
          </Link>
          <button
            onClick={logout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl glass border border-white/10 hover:border-white/30 text-textSecondary text-xs font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Locked;
