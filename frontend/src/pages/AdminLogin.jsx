import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, KeyRound, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const AdminLogin = () => {
  const [email, setEmail] = useState('legalease.systemsupport@gmail.com');
  const [password, setPassword] = useState('Admin@123456');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await adminLogin(email, password, totpCode);
      if (res.requires2FA) {
        setRequires2FA(true);
        toast('Google Authenticator 2FA Code Required', { icon: '🔐' });
      } else {
        toast.success('Root Admin Session Established');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Red ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-danger/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 rounded-xl bg-danger/20 border border-danger flex items-center justify-center shadow-glow-danger">
            <ShieldAlert className="w-6 h-6 text-danger" />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">LegalEase Admin</span>
        </Link>
        <h2 className="text-center text-xl font-mono uppercase tracking-widest text-danger">
          [ Restricted Administrative Gateway ]
        </h2>
        <p className="mt-1 text-center text-xs text-slate-600 dark:text-textSecondary font-mono">
          Whitelisted IP &bull; TOTP Hardware Verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="card py-8 px-6 shadow-2xl border border-danger/30 sm:px-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/40 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-2">
                Administrator Email
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-2">
                Administrator Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-all font-mono"
                />
              </div>
            </div>

            {requires2FA && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs font-mono uppercase tracking-wider text-accent mb-2">
                  Google Authenticator (TOTP 6-Digit Code)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-accent">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="000000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-accent text-accent font-mono text-lg tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-danger hover:bg-danger/90 text-white font-bold text-sm shadow-glow-danger transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Authenticate Root Admin</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link to="/login" className="text-xs text-textSecondary hover:text-white">
              &larr; Return to Standard Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
