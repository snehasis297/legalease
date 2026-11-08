import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Scale, 
  RefreshCw,
  Clock
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

export default function VerificationQueue() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await adminService.getVerificationQueue({ status: filterStatus });
      const queueList = res.data?.data?.content || res.data?.content || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setQueue(Array.isArray(queueList) ? queueList : []);
    } catch (err) {
      console.error('Failed to load verification queue:', err);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [filterStatus]);

  const queueItems = Array.isArray(queue) ? queue : [];

  return (
    <DashboardLayout portalType="admin" title="Lawyer Verification Queue">
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Bar Council Verification Queue</h1>
              <p className="text-xs text-slate-300 mt-1">
                Validate practicing advocates, inspect license certificates, and grant counsel permissions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved Licenses</option>
                <option value="REJECTED">Rejected Applications</option>
              </select>

              <button
                onClick={fetchQueue}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition shadow-sm"
                title="Refresh Queue"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 overflow-hidden shadow-md">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner text="Fetching lawyer applications..." />
              </div>
            ) : queueItems.length === 0 ? (
              <div className="py-20 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-sm font-bold text-white">Verification Queue Clear</h3>
                <p className="text-xs text-slate-300 mt-1">
                  All lawyer Bar Council applications have been reviewed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Advocate Name</th>
                      <th className="py-3.5 px-4 font-semibold">Bar License ID</th>
                      <th className="py-3.5 px-4 font-semibold">Jurisdiction</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Submitted</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {queueItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div>
                            <span>{item.user?.fullName || item.fullName || 'Counsel'}</span>
                            <span className="text-[11px] text-slate-400 block">
                              {item.user?.email || item.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-indigo-300">
                          {item.barNumber || 'BAR/REG/PENDING'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {item.stateBar || 'State Council'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : item.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {item.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDate(item.createdAt || item.submittedAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/verifications/${item.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md shadow-indigo-600/20"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Audit Application
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </DashboardLayout>
  );
}
