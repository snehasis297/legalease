import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import appealService from '../../services/appealService';
import { formatDate } from '../../utils/formatters';

export default function Appeals() {
  const navigate = useNavigate();

  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const res = await appealService.getAllAppeals({ page: 0, size: 50 });
      const appealList = res.data?.data?.content || res.data?.content || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setAppeals(Array.isArray(appealList) ? appealList : []);
    } catch (err) {
      console.error('Failed to load appeals:', err);
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const appealList = Array.isArray(appeals) ? appeals : [];
  const filtered = appealList.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return (a.status || 'PENDING').toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <DashboardLayout portalType="admin" title="Account Appeals">
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Account Restoration Appeals</h1>
              <p className="text-xs text-slate-300 mt-1">
                30-day tokenized petitions submitted by disabled or flagged accounts with identity proofs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="ALL">All Appeals</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved / Restored</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={fetchAppeals}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl overflow-hidden shadow-md">
            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <HelpCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">No appeals found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  There are no pending restoration petitions matching your selection.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4 font-medium">Appellant</th>
                      <th className="py-3.5 px-4 font-medium">Appeal Summary</th>
                      <th className="py-3.5 px-4 font-medium">Status</th>
                      <th className="py-3.5 px-4 font-medium">Date Filed</th>
                      <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div>
                            <span>{item.user?.fullName || item.fullName || 'Appellant'}</span>
                            <span className="text-[11px] text-slate-400 block">
                              {item.user?.email || item.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate" title={item.reason}>
                          {item.reason}
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
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/admin/appeals/${item.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md shadow-indigo-600/20"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review Appeal
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
