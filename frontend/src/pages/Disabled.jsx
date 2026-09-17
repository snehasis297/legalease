import React, { useState } from 'react';
import { PauseCircle, Mail, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const Disabled = () => {
  const { user, logout } = useAuth();
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      await authService.resendOtp(user.email);
      toast.success('Appeal instructions resent to ' + user.email);
    } catch (err) {
      toast.error('Failed to resend instructions.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <div className="glass-card max-w-lg w-full p-8 rounded-2xl border border-warning/40 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-warning/20 border border-warning/40 flex items-center justify-center mx-auto">
          <PauseCircle className="w-9 h-9 text-warning" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Your Account Has Been Paused
          </h2>
          <p className="text-sm text-textSecondary leading-relaxed">
            Our security system detected unusual activity or age verification requirements on your account.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 text-xs text-left space-y-2">
          <div className="flex items-center text-accent font-semibold">
            <Mail className="w-4 h-4 mr-1.5" />
            <span>Check your registered email:</span>
          </div>
          <p className="text-gray-300">
            A secure verification link has been sent to your email address. The appeal link remains valid for <strong className="text-white">30 days</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-semibold shadow-glow-purple transition-all disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <Link
            to="/appeal"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl glass border border-white/10 hover:border-accent text-accent text-xs font-semibold transition-colors"
          >
            Submit Appeal with Token &rarr;
          </Link>
        </div>

        <div className="pt-6 border-t border-white/10 text-xs text-textSecondary flex justify-between items-center">
          <span>Contact: <a href="mailto:security@legalease.com" className="text-accent underline">security@legalease.com</a></span>
          <button onClick={logout} className="text-danger hover:underline">Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default Disabled;
