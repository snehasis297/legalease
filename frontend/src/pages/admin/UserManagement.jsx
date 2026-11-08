import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Ban, 
  Lock, 
  Unlock, 
  Eye, 
  RefreshCw 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [actionModal, setActionModal] = useState(null); // { type: 'SUSPEND'|'DISABLE'|'UNLOCK', user }
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await adminService.getAllUsers({ page: 0, size: 50 });
      const userList = res.data?.data?.content || res.data?.content || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setFetchError(err.response?.data?.message || err.message || 'Failed to connect to backend server. Please check your admin session.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Real-time polling every 12 seconds to reflect status changes, newly registered users, and lockouts
    const interval = setInterval(() => {
      fetchUsers();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteAction = async () => {
    if (!actionModal?.user) return;
    try {
      setProcessing(true);
      const userId = actionModal.user.id;
      if (actionModal.type === 'SUSPEND') {
        await adminService.suspendUser(userId, { reason: actionReason });
      } else if (actionModal.type === 'DISABLE') {
        await adminService.disableUser(userId, { reason: actionReason });
      } else if (actionModal.type === 'UNLOCK') {
        await adminService.unlockUser(userId);
      }
      setActionModal(null);
      setActionReason('');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to execute administrative action.');
    } finally {
      setProcessing(false);
    }
  };

  const userList = Array.isArray(users) ? users : [];
  const filtered = userList.filter((u) => {
    const query = search.toLowerCase();
    const matchesQuery =
      (u.fullName || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query);
    const matchesRole = filterRole === 'ALL' || (u.role || '').toUpperCase() === filterRole;
    const matchesStatus = filterStatus === 'ALL' || (u.status || u.accountStatus || '').toUpperCase() === filterStatus;
    return matchesQuery && matchesRole && matchesStatus;
  });

  return (
    <DashboardLayout portalType="admin" title="User Directory">
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">User Access &amp; Identity Directory</h1>
              <p className="text-xs text-slate-300 mt-1">
                Oversee platform accounts, toggle security states, and inspect multi-factor postures.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition inline-flex items-center gap-2 text-xs shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Directory
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="ALL">All Roles</option>
                <option value="CLIENT">Clients</option>
                <option value="LAWYER">Lawyers</option>
                <option value="ADMIN">Administrators</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="PENDING_KYC">Pending KYC</option>
                <option value="LOCKED">Locked</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl overflow-hidden shadow-md">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">No users found</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Adjust your search parameters or role filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto min-w-full">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">User Profile</th>
                      <th className="py-3.5 px-4 font-semibold">Role</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Phone (Masked)</th>
                      <th className="py-3.5 px-4 font-semibold">Joined</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filtered.map((u) => {
                      const raw = (u.accountStatus || u.status || (u.isEnabled === false ? 'DISABLED' : 'ACTIVE') || 'ACTIVE').toString().trim().toUpperCase();
                      const status = raw || 'ACTIVE';
                      const role = (u.role || 'CLIENT').toString().trim().toUpperCase();
                      const maskedPhone = u.maskedPhone || (u.phoneNumber ? u.phoneNumber.replace(/\d(?=\d{4})/g, '*') : '****0000');
                      
                      const isAct = status === 'ACTIVE';
                      const isLock = status === 'LOCKED';
                      const isPend = status.includes('PEND');
                      const isSusp = status === 'SUSPENDED';

                      const badgeClass = isAct
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : isLock
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : isPend
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        : isSusp
                        ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

                      const dotClass = isAct
                        ? 'bg-emerald-400'
                        : isLock
                        ? 'bg-amber-400'
                        : isPend
                        ? 'bg-sky-400'
                        : isSusp
                        ? 'bg-orange-400'
                        : 'bg-rose-400';

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-medium text-white block">{u.fullName || 'User'}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                              role === 'ADMIN'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : role === 'LAWYER'
                                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                              <span>{status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {maskedPhone}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => navigate(`/admin/users/${u.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition cursor-pointer"
                              title="Inspect Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {status === 'LOCKED' && (
                              <button
                                onClick={() => setActionModal({ type: 'UNLOCK', user: u })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 transition cursor-pointer"
                                title="Unlock Account"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {status !== 'SUSPENDED' && (
                              <button
                                onClick={() => setActionModal({ type: 'SUSPEND', user: u })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer"
                                title="Suspend Account"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {status !== 'DISABLED' && (
                              <button
                                onClick={() => setActionModal({ type: 'DISABLE', user: u })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                                title="Disable Account (Auto-generate appeal token)"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      {/* Action Modal */}
      {actionModal && (
        <Modal
          isOpen={true}
          onClose={() => setActionModal(null)}
          title={`${actionModal.type} Account: ${actionModal.user?.fullName}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              {actionModal.type === 'DISABLE'
                ? 'Disabling this account immediately invalidates all active JWT sessions and generates a 30-day tokenized appeal link dispatched to their registered email.'
                : actionModal.type === 'SUSPEND'
                ? 'Suspension immediately restricts access to contract uploads and AI interactions until lifted.'
                : 'Unlocking will reset failed password attempt counters and restore immediate login access.'}
            </p>

            {actionModal.type !== 'UNLOCK' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Administrative Reason *</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  placeholder="State the compliance policy or threat detection finding triggering this action..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={processing || (actionModal.type !== 'UNLOCK' && !actionReason.trim())}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium transition"
              >
                {processing ? 'Applying...' : `Confirm ${actionModal.type}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
