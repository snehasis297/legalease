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
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
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
      setAppeals(res.data?.content || res.data || []);
    } catch (err) {
      console.error('Failed to load appeals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const filtered = appeals.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return (a.status || 'PENDING') === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Account Restoration Appeals</h1>
              <p className="text-xs text-slate-400 mt-1">
                30-day tokenized petitions submitted by disabled or flagged accounts with identity proofs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Appeals</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved / Restored</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={fetchAppeals}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
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
        </main>
      </div>
    </div>
  );
}
