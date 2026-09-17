import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Ban, 
  CheckCircle2, 
  RefreshCw, 
  AlertTriangle,
  Lock,
  UserX
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

export default function SuspiciousActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSuspiciousActivities({ page: 0, size: 50 });
      setActivities(res.data?.content || res.data || []);
    } catch (err) {
      console.error('Failed to load threats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleBlacklistIp = async (ip, reason) => {
    try {
      await adminService.addBlacklistIp({ ipAddress: ip, reason: reason || 'Triggered heuristic threat detection' });
      setActionMessage(`IP ${ip} has been permanently blacklisted.`);
      setTimeout(() => setActionMessage(''), 4000);
      fetchActivities();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to blacklist IP.');
    }
  };

  const filtered = activities.filter((act) => {
    const query = search.toLowerCase();
    return (
      (act.threatType || '').toLowerCase().includes(query) ||
      (act.description || '').toLowerCase().includes(query) ||
      (act.ipAddress || '').includes(query) ||
      (act.userEmail || '').toLowerCase().includes(query)
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
              <h1 className="text-2xl font-bold text-white">Heuristic Threat Interceptions</h1>
              <p className="text-xs text-slate-400 mt-1">
                Automated security signals flagged by rate limiters, payload analyzers, and IP anomaly detectors.
              </p>
            </div>

            <button
              onClick={fetchActivities}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition inline-flex items-center gap-2 text-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Signals
            </button>
          </div>

          {actionMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Search Toolbar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by threat category, description, IP or account email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <ShieldAlert className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">Zero active threat alerts</h3>
                <p className="text-xs text-slate-400 mt-1">
                  All ingress requests adhere to standard security postures.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">Heuristic Flag</th>
                      <th className="py-3.5 px-4 font-medium">Description</th>
                      <th className="py-3.5 px-4 font-medium">Origin IP</th>
                      <th className="py-3.5 px-4 font-medium">Associated User</th>
                      <th className="py-3.5 px-4 font-medium">Detected At</th>
                      <th className="py-3.5 px-4 font-medium text-right">Countermeasure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filtered.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {act.threatType || 'RATE_SPIKE'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-white max-w-xs truncate" title={act.description}>
                          {act.description}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {act.ipAddress}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {act.userEmail || 'Anonymous'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDate(act.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleBlacklistIp(act.ipAddress, act.threatType)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition"
                            title="Add IP to Global Blacklist"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Blacklist IP
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
    </div>
  );
}
