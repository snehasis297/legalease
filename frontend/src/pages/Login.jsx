import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import OtpInput from '../components/auth/OtpInput';
import toast from 'react-hot-toast';

export const Login = () => {
  const [authMode, setAuthMode] = useState('OTP'); // 'OTP' or 'PASSWORD'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Admin / Demo Unlock State - default to false so regular clients/lawyers only see Passwordless OTP
  // Only accessible when admin enters secret passkey "admins72nbh20"
  const [isDemoUnlocked, setIsDemoUnlocked] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [showPasskeyText, setShowPasskeyText] = useState(false);

  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  const handleRouteAfterLogin = (user) => {
    toast.success('Welcome back, ' + (user.fullName || 'User'));
    if (user.accountStatus === 'ACTIVE') {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'LAWYER') navigate('/lawyer/dashboard');
      else navigate('/client/dashboard');
    } else if (user.accountStatus === 'PENDING_KYC') {
      navigate('/submit-kyc');
    } else if (user.accountStatus === 'PENDING_VERIFICATION') {
      if (user.isEmailVerified) {
        navigate(user.role === 'LAWYER' ? '/lawyer/kyc/status' : '/submit-kyc');
      } else {
        try {
          localStorage.setItem('pending_verification_email', user.email);
          sessionStorage.setItem('pending_verification_email', user.email);
        } catch (e) {}
        navigate('/verify-email', { state: { email: user.email, role: user.role } });
      }
    } else if (user.accountStatus === 'SUSPENDED') {
      navigate('/account-suspended');
    } else if (user.accountStatus === 'LOCKED') {
      navigate('/account-locked');
    } else {
      navigate('/account-disabled');
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    try {
      await authService.sendLoginOtp(email);
      try {
        localStorage.setItem('pending_verification_email', email);
        sessionStorage.setItem('pending_verification_email', email);
      } catch (e) {}
      toast.success(`Verification code dispatched to ${email}`);
      setOtpSent(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to dispatch sign-in code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    try {
      const user = await loginWithOtp(email, otp);
      handleRouteAfterLogin(user);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Invalid or expired sign-in code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const user = await login(email, password);
      handleRouteAfterLogin(user);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Admin Passkey to reveal Demo / Password mode ("admins72nbh20")
  const handleVerifyPasskey = (e) => {
    e.preventDefault();
    const cleanKey = adminPasskey.trim();
    if (cleanKey === 'admins72nbh20' || cleanKey.toLowerCase() === 'admins72nbh20') {
      setIsDemoUnlocked(true);
      sessionStorage.setItem('legalease_admin_unlocked', 'true');
      setAuthMode('PASSWORD');
      setShowPasskeyModal(false);
      setAdminPasskey('');
      setPasskeyError('');
      toast.success('Admin authorized! Demo evaluation & Password console unlocked.');
    } else {
      setPasskeyError('Invalid Admin Passkey. Please verify your administrator authorization.');
    }
  };

  const handleLockDemo = () => {
    setIsDemoUnlocked(false);
    sessionStorage.removeItem('legalease_admin_unlocked');
    setAuthMode('OTP');
    toast.success('Demo console locked.');
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-lg relative z-10 text-center mb-6">
        <Link to="/" className="inline-flex items-center justify-center space-x-3 mb-4 group">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary flex items-center justify-center group-hover:shadow-glow-cyan transition-all">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">LegalEase</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Or{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 underline font-medium">
            create a new account
          </Link>
        </p>
      </div>

      {/* Main Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-lg relative z-10">
        <div className="card p-6 sm:p-8 shadow-2xl rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          
          {/* Mode Switcher: Only displayed once Admin unlocks it with passkey */}
          {isDemoUnlocked ? (
            <div className="mb-6 space-y-2.5">
              <div className="flex rounded-xl bg-slate-900/90 p-1 border border-indigo-500/30 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('OTP');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    authMode === 'OTP'
                      ? 'bg-primary text-white shadow-glow-purple'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Passwordless OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('PASSWORD');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    authMode === 'PASSWORD'
                      ? 'bg-primary text-white shadow-glow-purple'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Demo / Admin Password 🔓</span>
                </button>
              </div>
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Admin Evaluation Active
                </span>
                <button
                  type="button"
                  onClick={handleLockDemo}
                  className="text-[11px] text-slate-400 hover:text-rose-400 underline transition"
                >
                  Lock Demo Console
                </button>
              </div>
            </div>
          ) : (
            /* Clean Title Header for Clients & Lawyers */
            <div className="mb-6 pb-4 border-b border-slate-800/80 text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Passwordless OTP Authentication</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Enter your registered email (Client, Lawyer, or Admin) to receive an instant 6-digit sign-in code.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* OTP Mode Form (Default for all Client, Lawyer, and Admin) */}
          {authMode === 'OTP' ? (
            !otpSent ? (
              <form className="space-y-5" onSubmit={handleRequestOtp}>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    We'll dispatch an instant 6-digit one-time code to authenticate your session.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Sign-In Code</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleVerifyOtp}>
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider truncate">
                      Code sent to {email}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-accent hover:underline flex-shrink-0"
                    >
                      Change Email
                    </button>
                  </div>
                  <div className="my-4">
                    <OtpInput length={6} value={otp} onChange={setOtp} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Authenticate &bull; Sign In</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-xs text-accent hover:underline cursor-pointer"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Password Mode Form (Only accessible when Admin unlocked) */
            <form className="space-y-5" onSubmit={handlePasswordLogin}>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Admin Evaluation &amp; Demo Console</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Real clients &amp; lawyers authenticate via <strong>Passwordless OTP</strong>. Click below to 1-click fill evaluation accounts:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('legalease.systemsupport@gmail.com');
                      setPassword('Admin@123456');
                    }}
                    className="w-full px-2 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-mono text-amber-200 border border-amber-500/30 transition text-center"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('lawyer@legalease.com');
                      setPassword('Lawyer@123456');
                    }}
                    className="w-full px-2 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-mono text-amber-200 border border-amber-500/30 transition text-center"
                  >
                    Demo Lawyer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('client@legalease.com');
                      setPassword('Client@123456');
                    }}
                    className="w-full px-2 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-mono text-amber-200 border border-amber-500/30 transition text-center"
                  >
                    Demo Client
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Controls: Perfectly aligned, zero-overflow responsive layout */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {!isDemoUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  setShowPasskeyModal(true);
                  setPasskeyError('');
                  setAdminPasskey('');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-mono text-slate-300 hover:text-indigo-300 transition-all shadow-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin &amp; Demo Console</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLockDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-mono text-rose-300 transition-all cursor-pointer"
              >
                <span>Lock Demo Console</span>
              </button>
            )}

            <Link
              to="/admin/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-rose-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-white/5"
            >
              <span>Admin 2FA Gateway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Secret Admin Passkey Modal */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="card w-full max-w-sm sm:max-w-md border border-indigo-500/30 p-6 sm:p-7 space-y-4 shadow-2xl relative rounded-2xl bg-slate-950">
            <button
              onClick={() => setShowPasskeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Admin Authorization Required</h3>
                <p className="text-[11px] text-slate-400">Restricted evaluation console</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your Administrator Secret Passkey to reveal the Password &amp; Demo evaluation controls.
            </p>

            {passkeyError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{passkeyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPasskey} className="space-y-4">
              <div className="relative">
                <input
                  type={showPasskeyText ? 'text' : 'password'}
                  required
                  autoFocus
                  value={adminPasskey}
                  onChange={(e) => {
                    setAdminPasskey(e.target.value);
                    setPasskeyError('');
                  }}
                  placeholder="Enter Secret Passkey"
                  className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskeyText(!showPasskeyText)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPasskeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasskeyModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!adminPasskey}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-semibold shadow-glow-purple transition disabled:opacity-50 cursor-pointer"
                >
                  Authorize Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
