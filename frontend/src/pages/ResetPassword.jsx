import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import OtpInput from '../components/auth/OtpInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setErrorMessage('');
    setLoading(true);

    try {
      await authService.resetPassword({ email, otp, newPassword });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      setErrorMessage(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Set New Password</h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-textSecondary">
          Enter the 6-digit recovery code and choose your new password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-6 sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            {!location.state?.email && (
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider text-center mb-4">
                Recovery 6-Digit Code
              </label>
              <OtpInput length={6} value={otp} onChange={setOtp} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
              />
              <PasswordStrength password={newPassword} />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || newPassword.length < 8}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password & Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
