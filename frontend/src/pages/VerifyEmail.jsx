import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';
import { tokenHelper } from '../utils/tokenHelper';
import { useAuth } from '../context/AuthContext';
import OtpInput from '../components/auth/OtpInput';
import toast from 'react-hot-toast';

export const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const initialEmail =
    location.state?.email ||
    sessionStorage.getItem('pending_verification_email') ||
    localStorage.getItem('pending_verification_email') ||
    '';

  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      setIsEditingEmail(true);
      return;
    }
    if (otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await authService.verifyEmail({ email: email.trim(), otp: otp.trim(), purpose: 'REGISTRATION' });
      const authData = res.data?.data || res.data;
      if (authData?.accessToken) {
        tokenHelper.setAccessToken(authData.accessToken);
        if (authData.refreshToken) {
          tokenHelper.setRefreshToken(authData.refreshToken);
        }
        const userData = {
          id: authData.userId,
          email: authData.email || email.trim(),
          fullName: authData.fullName,
          role: authData.role,
          accountStatus: authData.accountStatus,
        };
        setUser(userData);
        try {
          localStorage.setItem('legalease_user', JSON.stringify(userData));
          sessionStorage.setItem('legalease_user', JSON.stringify(userData));
          localStorage.removeItem('pending_verification_email');
          sessionStorage.removeItem('pending_verification_email');
        } catch (e) {}
      }

      toast.success('Email verified successfully!');
      if (authData?.role === 'LAWYER') {
        navigate('/lawyer/kyc/status');
      } else if (authData?.accountStatus === 'ACTIVE') {
        navigate('/client/dashboard');
      } else {
        navigate('/submit-kyc');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    try {
      await authService.resendOtp(email.trim());
      toast.success('A new 6-digit verification code has been dispatched to ' + email);
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary mx-auto flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Verify Your Email Address</h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-textSecondary max-w-sm mx-auto">
          We sent a real-time 6-digit verification code to{' '}
          <span className="font-semibold text-slate-800 dark:text-white font-mono">{email || 'your email'}</span>.
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Check your inbox (or spam) from <span className="font-mono text-accent">legalease.systemsupport@gmail.com</span> and enter the code below.
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

          {/* Email Card / Input */}
          {!isEditingEmail && email ? (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Code Sent To</p>
                  <p className="text-xs font-semibold text-white font-mono truncate">{email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingEmail(true)}
                className="text-xs text-accent hover:underline font-medium flex-shrink-0 ml-2"
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  Your Registered Email
                </label>
                {initialEmail && (
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Done
                  </button>
                )}
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  try {
                    localStorage.setItem('pending_verification_email', e.target.value);
                    sessionStorage.setItem('pending_verification_email', e.target.value);
                  } catch (err) {}
                }}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent font-mono"
              />
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider text-center mb-4">
                Enter 6-Digit Code
              </label>
              <OtpInput length={6} value={otp} onChange={setOtp} />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || !email}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Verify Email &bull; Continue</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || !email}
              className="text-xs text-accent hover:underline disabled:opacity-50 disabled:no-underline font-medium"
            >
              {resendCooldown > 0
                ? `Resend Code in ${resendCooldown}s`
                : "Didn't receive code? Resend Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
