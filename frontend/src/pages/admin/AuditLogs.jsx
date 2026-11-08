import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Laptop, 
  Clock 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({ page: 0, size: 50 });
      const logList = res.data?.data?.content || res.data?.content || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setLogs(Array.isArray(logList) ? logList : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const logList = Array.isArray(logs) ? logs : [];
  const filtered = logList.filter((log) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (log.action || '').toLowerCase().includes(query) ||
      (log.userEmail || '').toLowerCase().includes(query) ||
      (log.details || '').toLowerCase().includes(query) ||
      (log.ipAddress || '').includes(query);
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <DashboardLayout portalType="admin" title="Audit Trail">
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Immutable Security Audit Logs</h1>
              <p className="text-xs text-slate-300 mt-1">
                Tamper-evident forensic record of all administrative actions, authentications, and data modifications.
              </p>
            </div>

            <button
              onClick={fetchLogs}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold transition inline-flex items-center gap-2 text-xs shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Stream
            </button>
          </div>

          {/* Search & Filter */}
          <div className="bg-slate-900/90 border border-slate-700/60 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by actor, action, IP or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="ALL">All Event Types</option>
                <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                <option value="LOGIN_FAILURE">LOGIN_FAILURE</option>
                <option value="DOCUMENT_UPLOAD">DOCUMENT_UPLOAD</option>
                <option value="ACCOUNT_DISABLED">ACCOUNT_DISABLED</option>
                <option value="IP_BLACKLISTED">IP_BLACKLISTED</option>
                <option value="KYC_DECISION">KYC_DECISION</option>
              </select>
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
                <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">No audit records found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust your search or event type filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-mono font-bold">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Timestamp (UTC)</th>
                      <th className="py-3.5 px-4 font-semibold">Action Event</th>
                      <th className="py-3.5 px-4 font-semibold">Actor</th>
                      <th className="py-3.5 px-4 font-semibold">Client IP</th>
                      <th className="py-3.5 px-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                    {filtered.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {formatDate(log.createdAt || log.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white">
                          {log.userEmail || 'SYSTEM'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-sans text-xs" title={log.details}>
                          {log.details || '—'}
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
