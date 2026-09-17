import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Ban, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Activity 
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUser(id);
      setUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const handleAction = async (actionType) => {
    try {
      setError('');
      setSuccess('');
      if (actionType === 'UNLOCK') {
        await adminService.unlockUser(id);
        setSuccess('Account unlocked successfully.');
      } else if (actionType === 'SUSPEND') {
        await adminService.suspendUser(id, { reason: 'Admin triggered manual suspension' });
        setSuccess('Account suspended.');
      } else if (actionType === 'DISABLE') {
        await adminService.disableUser(id, { reason: 'Admin triggered manual deactivation' });
        setSuccess('Account disabled. 30-day appeal token issued.');
      }
      loadUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to User Directory
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(user.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold text-white">{user.fullName}</h1>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {user.status === 'LOCKED' && (
                    <button
                      onClick={() => handleAction('UNLOCK')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Unlock Account
                    </button>
                  )}

                  {user.status !== 'SUSPENDED' && (
                    <button
                      onClick={() => handleAction('SUSPEND')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  )}

                  {user.status !== 'DISABLED' && (
                    <button
                      onClick={() => handleAction('DISABLE')}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Disable & Issue Appeal
                    </button>
                  )}
                </div>
              </div>

              {/* Identity & Security Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Identity Attributes
                  </h2>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Account Status</span>
                      <span className="font-semibold text-white">{user.status}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Masked Phone</span>
                      <span className="font-mono text-slate-300">{user.maskedPhone || '****0000'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Govt ID Hash</span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        SHA-256 Hash Stored (Raw ID Zero-Knowledge)
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Registered On</span>
                      <span className="text-slate-300">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Authentication Posture
                  </h2>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Email Verified</span>
                      <span className="text-emerald-400 font-medium">
                        {user.emailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Phone OTP Verified</span>
                      <span className="text-emerald-400 font-medium">
                        {user.phoneVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">TOTP Two-Factor</span>
                      <span className={user.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-400'}>
                        {user.twoFactorEnabled ? 'Active (HS512 TOTP)' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">KYC Status</span>
                      <span className="text-indigo-400 font-medium">{user.kycStatus || 'VERIFIED'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
