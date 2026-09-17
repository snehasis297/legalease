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
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers({ page: 0, size: 50 });
      setUsers(res.data?.content || res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const filtered = users.filter((u) => {
    const query = search.toLowerCase();
    const matchesQuery =
      (u.fullName || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query);
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    return matchesQuery && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">User Access & Identity Directory</h1>
              <p className="text-xs text-slate-400 mt-1">
                Oversee platform accounts, toggle security states, and inspect multi-factor postures.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition inline-flex items-center gap-2 text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Directory
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Roles</option>
                <option value="CLIENT">Clients</option>
                <option value="LAWYER">Lawyers</option>
                <option value="ADMIN">Administrators</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="LOCKED">Locked</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">No users found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust your search parameters or role filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">User Profile</th>
                      <th className="py-3.5 px-4 font-medium">Role</th>
                      <th className="py-3.5 px-4 font-medium">Status</th>
                      <th className="py-3.5 px-4 font-medium">Phone (Masked)</th>
                      <th className="py-3.5 px-4 font-medium">Joined</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-medium text-white block">{u.fullName || 'User'}</span>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : u.status === 'LOCKED'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {u.maskedPhone || '****0000'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition"
                            title="Inspect Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {u.status === 'LOCKED' && (
                            <button
                              onClick={() => setActionModal({ type: 'UNLOCK', user: u })}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 transition"
                              title="Unlock Account"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {u.status !== 'SUSPENDED' && (
                            <button
                              onClick={() => setActionModal({ type: 'SUSPEND', user: u })}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-400 transition"
                              title="Suspend Account"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {u.status !== 'DISABLED' && (
                            <button
                              onClick={() => setActionModal({ type: 'DISABLE', user: u })}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                              title="Disable Account (Auto-generate appeal token)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
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
    </div>
  );
}
