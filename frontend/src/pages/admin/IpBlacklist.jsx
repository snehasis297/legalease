import React, { useState, useEffect } from 'react';
import { 
  Ban, 
  Plus, 
  Trash2, 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

export default function IpBlacklist() {
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchBlacklist = async () => {
    try {
      setLoading(true);
      const res = await adminService.getIpBlacklist({ page: 0, size: 50 });
      setBlacklist(res.data?.content || res.data || []);
    } catch (err) {
      console.error('Failed to load blacklist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleAddIp = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await adminService.addBlacklistIp({ ipAddress: ipAddress.trim(), reason: reason.trim() });
      setShowAddModal(false);
      setIpAddress('');
      setReason('');
      setMessage(`IP ${ipAddress} successfully added to global ban list.`);
      setTimeout(() => setMessage(''), 3000);
      fetchBlacklist();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to blacklist IP.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id, ip) => {
    if (!window.confirm(`Are you sure you want to unban IP ${ip}?`)) return;
    try {
      await adminService.removeBlacklistIp(id);
      setMessage(`IP ${ip} removed from blacklist.`);
      setTimeout(() => setMessage(''), 3000);
      fetchBlacklist();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove IP.');
    }
  };

  const filtered = blacklist.filter((item) => {
    const query = search.toLowerCase();
    return (
      (item.ipAddress || '').includes(query) ||
      (item.reason || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Global IP Blacklist</h1>
              <p className="text-xs text-slate-400 mt-1">
                Zero-tolerance perimeter filtering. Requests from blacklisted IPs are immediately dropped at filter level.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchBlacklist}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition inline-flex items-center gap-2 text-xs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition shadow-lg shadow-rose-600/20"
              >
                <Plus className="w-4 h-4" />
                Add Banned IP
              </button>
            </div>
          </div>

          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Search */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by IP address or ban reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Ban className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">Blacklist is currently empty</h3>
                <p className="text-xs text-slate-400 mt-1">
                  No IP addresses are currently blocked by administrators.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">Banned IP Address</th>
                      <th className="py-3.5 px-4 font-medium">Ban Reason</th>
                      <th className="py-3.5 px-4 font-medium">Enforced By</th>
                      <th className="py-3.5 px-4 font-medium">Enforced Date</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-mono font-semibold text-rose-400">
                          {item.ipAddress}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {item.reason || 'Malicious heuristic activity'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {item.bannedBy || 'SECURITY_ADMIN'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleRemove(item.id, item.ipAddress)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Unban IP Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add IP Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Add IP Address to Global Blacklist"
        >
          <form onSubmit={handleAddIp} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 mb-1">IP Address (IPv4 / IPv6) *</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 203.0.113.195"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Reason for Blacklist *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Credential stuffing, unauthorized scraping, payload injection attempt..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium transition"
              >
                {submitting ? 'Blocking...' : 'Enforce Permanent Ban'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
