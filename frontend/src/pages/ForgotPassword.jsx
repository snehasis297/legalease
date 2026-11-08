import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await authService.forgotPassword({ email });
      toast.success('Reset code dispatched to ' + email);
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch password reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary mx-auto flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Reset Account Password</h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-textSecondary">
          Enter your registered email address to receive a secure 6-digit recovery OTP.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Code'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-textSecondary hover:text-white">
              &larr; Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
