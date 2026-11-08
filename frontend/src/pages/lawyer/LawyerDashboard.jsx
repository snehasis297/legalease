import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Scale, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  UserCheck,
  Eye,
  MessageSquare
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ContractAnalyticsSection from '../../components/dashboard/ContractAnalyticsSection';
import RiskBadge from '../../components/analysis/RiskBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import lawyerService from '../../services/lawyerService';
import documentService from '../../services/documentService';
import { formatDate } from '../../utils/formatters';

export default function LawyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState(null);

  useEffect(() => {
    async function loadLawyerData() {
      try {
        setLoading(true);
        // Check KYC status
        const kycRes = await lawyerService.getKycStatus().catch(() => null);
        if (kycRes?.data) setKycData(kycRes.data);

        // Fetch documents for review
        const docRes = await lawyerService.getPendingReviews().catch(() => null);
        if (docRes?.data) {
          const dList = docRes.data?.data?.content || docRes.data?.content || docRes.data?.data || (Array.isArray(docRes.data) ? docRes.data : []);
          setDocuments(Array.isArray(dList) ? dList : []);
        } else {
          // Fallback to all documents
          const allDocs = await documentService.getMyDocuments().catch(() => ({ data: [] }));
          const dList = allDocs.data?.data?.content || allDocs.data?.content || allDocs.data?.data || (Array.isArray(allDocs.data) ? allDocs.data : []);
          setDocuments(Array.isArray(dList) ? dList : []);
        }
      } catch (err) {
        console.error('Lawyer dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLawyerData();
  }, []);

  const isVerified = user?.kycStatus === 'VERIFIED' || kycData?.status === 'APPROVED';

  return (
    <DashboardLayout
      portalType="lawyer"
      title="Counsel Overview"
      badge="Certified Lawyer Workspace"
      badgeIcon={Scale}
    >
      {/* KYC Status Warning Banner if not verified */}
      {!isVerified && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Bar License Verification Required</h3>
              <p className="text-xs text-amber-700 dark:text-amber-200/80">
                To review contracts and issue certified legal memorandums, your Bar Council credential must be verified.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/lawyer/kyc-upload"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition shadow-sm"
            >
              Upload Bar ID
            </Link>
            <Link
              to="/lawyer/kyc-status"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold transition"
            >
              Check Status
            </Link>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950/70 text-purple-300 border border-purple-700/60 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              Counsel Portal
            </span>
            {isVerified && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Bar Verified
              </span>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
            Welcome, {user?.fullName ? (user.fullName.toLowerCase().startsWith('adv') ? user.fullName : `Adv. ${user.fullName}`) : 'Counsel'}
          </h1>
          <p className="text-xs text-slate-300">
            Review automated clause extractions, validate high-risk exposures, and advise clients securely.
          </p>
        </div>
      </div>

      {/* Interactive Contract Analytics Section */}
      <ContractAnalyticsSection documents={documents} />

      {/* Counsel Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-5 sm:p-6 shadow-md flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contracts in Queue</span>
          <p className="text-3xl font-black font-mono text-white mt-2 mb-1">{documents.length}</p>
          <span className="text-xs text-slate-400">Awaiting counsel review</span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-5 sm:p-6 shadow-md flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">High Risk Clauses</span>
          <p className="text-3xl font-black font-mono text-rose-400 mt-2 mb-1">
            {(Array.isArray(documents) ? documents : []).filter((d) => (d.overallRiskScore || d.riskScore || 0) >= 70).length}
          </p>
          <span className="text-xs text-rose-400 font-bold">Critical exposure</span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-5 sm:p-6 shadow-md flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Completed Audits</span>
          <p className="text-3xl font-black font-mono text-emerald-400 mt-2 mb-1">
            {(Array.isArray(documents) ? documents : []).filter((d) => d.status === 'ANALYZED' || d.status === 'DONE').length}
          </p>
          <span className="text-xs text-emerald-400 font-bold">Verified &amp; certified</span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-5 sm:p-6 shadow-md flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Average Turnaround</span>
          <p className="text-3xl font-black font-mono text-white mt-2 mb-1">&lt; 2 hours</p>
          <span className="text-xs text-slate-400">Accelerated by AI parsing</span>
        </div>
      </div>

      {/* Client Contract Review dedicated section */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-700/60 p-5 sm:p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Client Contract Review</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-500/40">
                    Live Client Queue
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Personally examine original client contracts, issue independent legal opinions, and certify assessments
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-xl">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">Review Queue Clear</h3>
                <p className="text-xs text-slate-400 mt-1">
                  There are no contracts currently pending lawyer review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto min-w-full">
                <table className="w-full min-w-[700px] text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-300 font-bold">
                    <tr>
                      <th className="pb-3 font-semibold">Contract Title</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Risk Score</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Date Uploaded</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-slate-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 pr-3 font-bold text-white max-w-xs truncate">
                          {doc.title || doc.originalFileName}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-300">
                            {doc.contractType || 'CONTRACT'}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 font-bold font-mono text-slate-200">
                          {doc.overallRiskScore !== undefined && doc.overallRiskScore !== null
                            ? `${doc.overallRiskScore} / 100`
                            : 'Pending'}
                        </td>
                        <td className="py-3.5 pr-3">
                          <RiskBadge level={doc.riskLevel} score={doc.overallRiskScore ?? doc.riskScore} />
                        </td>
                        <td className="py-3.5 pr-3 text-slate-400">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/lawyer/review/${doc.id}`)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review &amp; Redline</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
    </DashboardLayout>
  );
}
