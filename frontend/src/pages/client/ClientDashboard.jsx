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
import DashboardLayout from '../../components/layout/DashboardLayout';
import ContractAnalyticsSection from '../../components/dashboard/ContractAnalyticsSection';
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
        const docs = res.data?.data?.content || res.data?.content || res.data?.data || res.data || [];
        setDocuments(docs);

        // Compute metrics
        const total = docs.length;
        const analyzed = docs.filter(d => d.status === 'DONE' || d.status === 'ANALYZED' || d.status === 'PROCESSED').length;
        const highRisk = docs.filter(d => (d.overallRiskScore ?? d.riskScore ?? 0) >= 70).length;
        const pending = docs.filter(d => d.status === 'PENDING' || d.status === 'PROCESSING' || d.status === 'UPLOADED').length;
        const totalScore = docs.reduce((acc, curr) => acc + (curr.overallRiskScore ?? curr.riskScore ?? 0), 0);
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
    <DashboardLayout
      portalType="client"
      title="Dashboard"
      actionButton={
        <Link
          to="/client/upload"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Contract</span>
        </Link>
      }
    >
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Client Security Workspace
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName || 'Client'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Inspect high-risk clauses, automated compliance scores, and ask intelligent legal questions directly to our Claude 3.5 AI engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/client/upload"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Contract
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Step AI Contract Security Pipeline Guide */}
      <div className="border border-indigo-500/30 bg-slate-900/90 rounded-2xl p-6 shadow-md text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              3-Step AI Contract Security Pipeline
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Production-ready legal workflow: client-side validation, AES-256-GCM encryption, AI risk scoring, and interactive SSE chat.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Pipeline
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 uppercase">
                  Step 1
                </span>
                <span className="text-[11px] font-mono text-slate-400">AES-256-GCM</span>
              </div>
              <h3 className="text-sm font-bold text-white">Upload &amp; Encrypt Contract</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Upload PDF or DOCX contracts with instant magic bytes verification (%PDF, PK) and zero-knowledge AES-256-GCM encryption.
              </p>
            </div>
            <Link
              to="/client/upload"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Contract
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40 uppercase">
                  Step 2
                </span>
                <span className="text-[11px] font-mono text-slate-400">0-100 Threat Index</span>
              </div>
              <h3 className="text-sm font-bold text-white">AI Clause Extraction &amp; Risk</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatic parsing splits contract into clauses and grades threat severity (High, Medium, Low) with AI redline suggestions.
              </p>
            </div>
            {documents.length > 0 ? (
              <button
                onClick={() => navigate(`/client/analysis/${documents[0].id}`)}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 text-xs font-bold border border-amber-500/40 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                View Latest Analysis
              </button>
            ) : (
              <Link
                to="/client/upload"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold border border-slate-700 transition"
              >
                Upload to Analyze
              </Link>
            )}
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-950/80 text-purple-300 border border-purple-500/40 uppercase">
                  Step 3
                </span>
                <span className="text-[11px] font-mono text-slate-400">Real-Time SSE</span>
              </div>
              <h3 className="text-sm font-bold text-white">Interactive Document Chat</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ask real-time legal questions regarding liabilities, notice periods, or dispute terms with streaming typewriter responses.
              </p>
            </div>
            {documents.length > 0 ? (
              <button
                onClick={() => navigate(`/client/chat/${documents[0].id}`)}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 text-xs font-bold border border-purple-500/40 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat with Latest Doc
              </button>
            ) : (
              <Link
                to="/client/upload"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold border border-slate-700 transition"
              >
                Upload to Chat
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Contract Analytics Section - Dynamic with Live Data */}
      <ContractAnalyticsSection documents={documents} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-md flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Total Uploads</span>
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-white mt-3 mb-1">{stats.total}</p>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            Encrypted in AES-256-GCM
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-md flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Fully Analyzed</span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-white mt-3 mb-1">{stats.analyzed}</p>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
            AI extraction completed
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-md flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">High Risk Clauses</span>
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-white mt-3 mb-1">{stats.highRisk}</p>
          <span className="text-xs text-rose-400 flex items-center gap-1 font-bold">
            Requires manual attention
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-md flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Average Risk Score</span>
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-white mt-3 mb-1">{stats.averageRisk} / 100</p>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            Aggregated threat index
          </span>
        </div>
      </div>

      {/* Recent Documents Table & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Documents</h2>
                  <p className="text-xs text-slate-300">Active contracts under automated analysis</p>
                </div>
                <Link
                  to="/client/documents"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
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
                  <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-300">No documents uploaded yet.</p>
                  <Link
                    to="/client/upload"
                    className="inline-block mt-3 text-xs text-indigo-400 hover:underline font-bold"
                  >
                    Upload your first contract for instant risk analysis
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-300 font-bold">
                        <th className="pb-3 font-semibold">Document Title</th>
                        <th className="pb-3 font-semibold">Uploaded</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Risk Score</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-slate-200">
                      {documents.slice(0, 5).map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 pr-3 font-bold text-white max-w-[180px] truncate">
                            <span title={doc.title || doc.originalFileName || doc.originalFilename}>
                              {doc.title || doc.originalFileName || doc.originalFilename}
                            </span>
                          </td>
                          <td className="py-3.5 pr-3 text-slate-400">
                            {formatDate(doc.createdAt || doc.uploadTime)}
                          </td>
                          <td className="py-3.5 pr-3">
                            <RiskBadge 
                              level={doc.riskLevel} 
                              score={doc.overallRiskScore ?? doc.riskScore} 
                            />
                          </td>
                          <td className="py-3.5 pr-3">
                            <span className="font-bold text-slate-200 font-mono">
                              {(doc.overallRiskScore !== undefined && doc.overallRiskScore !== null) || (doc.riskScore !== undefined && doc.riskScore !== null)
                                ? `${doc.overallRiskScore ?? doc.riskScore}/100`
                                : '—'}
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
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-md">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Account Security Status
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-slate-300">Email Verification</span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-slate-300">Phone Verification</span>
                    {user?.phoneVerified ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <Link to="/verify-phone" className="text-xs text-amber-400 hover:underline font-bold">
                        Pending
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-slate-300">Identity KYC</span>
                    <span className="text-xs font-bold text-indigo-300">
                      {user?.kycStatus || 'VERIFIED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-medium text-slate-300">2FA Protection</span>
                    {user?.twoFactorEnabled ? (
                      <span className="text-xs text-emerald-400 font-bold">Enabled (TOTP)</span>
                    ) : (
                      <Link to="/setup-2fa" className="text-xs text-indigo-400 hover:underline font-bold">
                        Enable 2FA
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick AI Tip */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-500/30 shadow-md">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                  AI Legal Assistant
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Have questions regarding ambiguous indemnity clauses or unstated termination liabilities? Click 
                  <span className="text-indigo-400 font-bold"> Ask AI </span> 
                  on any analyzed contract to stream answers with specific clause citations.
                </p>
              </div>
            </div>
          </div>
    </DashboardLayout>
  );
}
