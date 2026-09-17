import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Copy, Check, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import OtpInput from '../components/auth/OtpInput';

export default function SetupTwoFactor() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [qrCodeUri, setQrCodeUri] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchTwoFactorDetails() {
      try {
        setLoading(true);
        const res = await authService.getTwoFactorSetup();
        if (res.data) {
          setQrCodeUri(res.data.qrCodeUri || '');
          setSecretKey(res.data.secretKey || res.data.secret || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize 2FA setup.');
      } finally {
        setLoading(false);
      }
    }
    fetchTwoFactorDetails();
  }, []);

  const handleCopy = () => {
    if (!secretKey) return;
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyAndEnable = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit authenticator code.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await authService.enableTwoFactor(otp);
      setSuccess(true);
      setTimeout(() => {
        if (user?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (user?.role === 'LAWYER') {
          navigate('/lawyer/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid authenticator code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Setup Two-Factor Authentication</h1>
            <p className="text-slate-400 text-xs">Secure your account with Google Authenticator or Authy</p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication Enabled!</h2>
            <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
          </div>
        ) : loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Generating security keys...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <p className="text-xs text-slate-300 font-medium">1. Scan QR code in your Authenticator app:</p>
              {qrCodeUri ? (
                <div className="bg-white p-3 rounded-lg w-48 h-48 mx-auto flex items-center justify-center">
                  <img src={qrCodeUri} alt="2FA QR Code" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  QR Code not available. Please use the secret key below.
                </div>
              )}

              <p className="text-xs text-slate-300 font-medium pt-2">2. Or enter the secret key manually:</p>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-xs text-indigo-300 select-all flex-1 truncate">
                  {secretKey || 'SECRET-KEY-UNAVAILABLE'}
                </span>
                <button
                  onClick={handleCopy}
                  type="button"
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  title="Copy secret key"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyAndEnable} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  3. Enter the 6-digit confirmation code:
                </label>
                <div className="flex justify-center">
                  <OtpInput length={6} value={otp} onChange={setOtp} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition text-xs text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting || otp.length !== 6}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20"
                >
                  {submitting ? 'Verifying...' : 'Activate 2FA'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
