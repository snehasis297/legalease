import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Mail, ArrowRight, AlertCircle, Loader2, Award, KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await authService.register({ fullName, email, role });
      try {
        localStorage.setItem('pending_verification_email', email);
        sessionStorage.setItem('pending_verification_email', email);
        sessionStorage.setItem('pending_verification_role', role);
      } catch (e) {}
      toast.success('Registration initiated. Verification OTP sent to ' + email);
      navigate('/verify-email', { state: { email, role } });
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || '';
      if (err.response?.status === 409 || serverMsg.toLowerCase().includes('already registered')) {
        setErrorMessage(
          <span>
            This email is already registered.{' '}
            <Link to="/login" className="underline font-bold text-indigo-400 hover:text-indigo-300">
              Sign In here
            </Link>{' '}
            or use a different email address.
          </span>
        );
      } else {
        setErrorMessage(serverMsg || 'Registration failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary flex items-center justify-center group-hover:shadow-glow-cyan transition-all">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">LegalEase</span>
        </Link>
        <h2 className="text-center text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Create Your LegalEase Account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-600 dark:text-textSecondary">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-accent hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="card shadow-2xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start space-x-3 text-xs text-danger">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role selector pill */}
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    role === 'CLIENT'
                      ? 'bg-primary border-primary text-white shadow-glow-purple'
                      : 'border-white/10 bg-card text-textSecondary hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Client / Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('LAWYER')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    role === 'LAWYER'
                      ? 'bg-primary border-primary text-white shadow-glow-purple'
                      : 'border-white/10 bg-card text-textSecondary hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4 text-accent" />
                  <span>Verified Lawyer</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Adv. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                Real Work or Personal Email
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
                  placeholder="name@yourdomain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-white/10 text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A real-time 6-digit cryptographic verification OTP will be delivered directly to your inbox.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-accent/10 border border-accent/20 flex items-start space-x-3 text-xs text-textSecondary">
              <KeyRound className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-white font-medium">Passwordless Real-Time Verification</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No cumbersome passwords required. We secure your account with instantaneous cryptographic one-time codes, following modern passwordless security standards.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-sm shadow-glow-purple transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Generate Verification Code</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
