import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import documentService from '../../services/documentService';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import RiskBadge from '../../components/analysis/RiskBadge';
import RiskGauge from '../../components/analysis/RiskGauge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    analyzed: 0,
    highRisk: 0,
    pending: 0,
    averageRisk: 0
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await documentService.getMyDocuments({ page: 0, size: 10 });
        const docs = res.data?.content || res.data || [];
        setDocuments(docs);

        // Compute metrics
        const total = docs.length;
        const analyzed = docs.filter(d => d.status === 'ANALYZED').length;
        const highRisk = docs.filter(d => (d.overallRiskScore || 0) >= 70).length;
        const pending = docs.filter(d => d.status === 'UPLOADED' || d.status === 'ANALYZING').length;
        const totalScore = docs.reduce((acc, curr) => acc + (curr.overallRiskScore || 0), 0);
        const averageRisk = total > 0 ? Math.round(totalScore / total) : 0;

        setStats({ total, analyzed, highRisk, pending, averageRisk });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 p-8 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Client Security Workspace
                </span>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Welcome back, {user?.fullName || 'Client'}
                </h1>
                <p className="text-slate-400 text-sm mt-1 max-w-xl">
                  Inspect high-risk clauses, automated compliance scores, and ask intelligent legal questions directly to our Claude 3.5 AI engine.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/client/upload"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Contract
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Uploads</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mt-3">{stats.total}</p>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                Encrypted in AES-256-GCM
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Fully Analyzed</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mt-3">{stats.analyzed}</p>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                AI extraction completed
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">High Risk Clauses</span>
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mt-3">{stats.highRisk}</p>
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                Requires manual attention
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Average Risk Score</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mt-3">{stats.averageRisk} / 100</p>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                Aggregated threat index
              </span>
            </div>
          </div>

          {/* Recent Documents Table & Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Recent Documents</h2>
                  <p className="text-xs text-slate-400">Active contracts under automated analysis</p>
                </div>
                <Link
                  to="/client/documents"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                >
                  View all ({stats.total})
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
                  <UploadCloud className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No documents uploaded yet.</p>
                  <Link
                    to="/client/upload"
                    className="inline-block mt-3 text-xs text-indigo-400 hover:underline"
                  >
                    Upload your first contract for instant risk analysis
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-medium">Document Title</th>
                        <th className="pb-3 font-medium">Uploaded</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Risk Score</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {documents.slice(0, 5).map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 pr-3 font-medium text-white max-w-[180px] truncate">
                            <span title={doc.title || doc.originalFileName}>
                              {doc.title || doc.originalFileName}
                            </span>
                          </td>
                          <td className="py-3.5 pr-3 text-slate-400">
                            {formatDate(doc.createdAt)}
                          </td>
                          <td className="py-3.5 pr-3">
                            <RiskBadge risk={doc.status} />
                          </td>
                          <td className="py-3.5 pr-3">
                            <span className="font-semibold text-slate-200">
                              {doc.overallRiskScore !== undefined && doc.overallRiskScore !== null ? `${doc.overallRiskScore}/100` : '—'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => navigate(`/client/analysis/${doc.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition inline-flex items-center gap-1"
                              title="View Analysis"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/client/chat/${doc.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-white transition inline-flex items-center gap-1"
                              title="Ask AI Assistant"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Account Safety & Security Card */}
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Account Security Status
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs text-slate-300">Email Verification</span>
                    {user?.emailVerified ? (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <Link to="/verify-email" className="text-xs text-amber-400 hover:underline">
                        Pending
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs text-slate-300">Phone Verification</span>
                    {user?.phoneVerified ? (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <Link to="/verify-phone" className="text-xs text-amber-400 hover:underline">
                        Pending
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs text-slate-300">Identity KYC</span>
                    <span className="text-xs font-medium text-indigo-300">
                      {user?.kycStatus || 'VERIFIED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-xs text-slate-300">2FA Protection</span>
                    {user?.twoFactorEnabled ? (
                      <span className="text-xs text-emerald-400 font-medium">Enabled (TOTP)</span>
                    ) : (
                      <Link to="/setup-2fa" className="text-xs text-indigo-400 hover:underline">
                        Enable 2FA
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick AI Tip */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-slate-900 border border-indigo-500/20">
                <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                  AI Legal Assistant
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Have questions regarding ambiguous indemnity clauses or unstated termination liabilities? Click 
                  <span className="text-indigo-400 font-medium"> Ask AI </span> 
                  on any analyzed contract to stream answers with specific clause citations.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
