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

  const [email, setEmail] = useState(location.state?.email || '');
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
    if (otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await authService.verifyEmail({ email, otp, purpose: 'REGISTRATION' });
      const authData = res.data;
      if (authData.accessToken) {
        tokenHelper.setAccessToken(authData.accessToken);
        setUser({
          id: authData.userId,
          email: authData.email,
          fullName: authData.fullName,
          role: authData.role,
          accountStatus: authData.accountStatus,
        });
      }

      toast.success('Email verified successfully! Please complete KYC verification.');
      navigate('/submit-kyc');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    try {
      await authService.resendOtp(email);
      toast.success('A new verification code has been dispatched to ' + email);
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary mx-auto flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Verify Your Email Address</h2>
        <p className="mt-2 text-xs text-textSecondary max-w-sm mx-auto">
          We sent a 6-digit cryptographic verification code to{' '}
          <span className="font-semibold text-white">{email || 'your email'}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-6 rounded-2xl border border-white/10 sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!location.state?.email && (
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Your Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent"
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
              disabled={loading || otp.length !== 6}
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
              disabled={resendCooldown > 0}
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
