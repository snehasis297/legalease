import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success('Welcome back, ' + user.fullName);

      // Route by status / role
      if (user.accountStatus === 'PENDING_VERIFICATION') {
        navigate(user.role === 'LAWYER' ? '/lawyer/kyc/status' : '/verify-email');
      } else if (user.accountStatus === 'PENDING_KYC') {
        navigate('/submit-kyc');
      } else if (user.accountStatus === 'ACTIVE') {
        if (user.role === 'ADMIN') navigate('/admin/dashboard');
        else if (user.role === 'LAWYER') navigate('/lawyer/dashboard');
        else navigate('/client/dashboard');
      } else if (user.accountStatus === 'SUSPENDED') {
        navigate('/suspended');
      } else if (user.accountStatus === 'LOCKED') {
        navigate('/locked');
      } else {
        navigate('/disabled');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary flex items-center justify-center group-hover:shadow-glow-cyan transition-all">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">LegalEase</span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-white tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-center text-xs text-textSecondary">
          Or{' '}
          <Link to="/register" className="text-accent hover:underline font-medium">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-6 shadow-2xl rounded-2xl border border-white/10 sm:px-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Root Admin Gateway Link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              to="/admin/login"
              className="text-xs font-mono text-textSecondary hover:text-danger transition-colors"
            >
              [ Administrator 2FA Gateway &rarr; ]
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
