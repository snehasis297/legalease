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
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
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
          setDocuments(docRes.data?.content || docRes.data || []);
        } else {
          // Fallback to all documents
          const allDocs = await documentService.getMyDocuments().catch(() => ({ data: [] }));
          setDocuments(allDocs.data?.content || allDocs.data || []);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          {/* KYC Status Warning Banner if not verified */}
          {!isVerified && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Bar License Verification Required</h3>
                  <p className="text-xs text-amber-200/80">
                    To review contracts and issue certified legal memorandums, your Bar Council credential must be verified.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/lawyer/kyc-upload"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition"
                >
                  Upload Bar ID
                </Link>
                <Link
                  to="/lawyer/kyc-status"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                >
                  Check Status
                </Link>
              </div>
            </div>
          )}

          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  Counsel Portal
                </span>
                {isVerified && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bar Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Welcome, Adv. {user?.fullName || 'Counsel'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Review automated clause extractions, validate high-risk exposures, and advise clients securely.
              </p>
            </div>
          </div>

          {/* Counsel Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
              <span className="text-xs font-medium text-slate-400">Contracts in Queue</span>
              <p className="text-2xl font-bold text-white mt-2">{documents.length}</p>
              <span className="text-[11px] text-slate-500">Awaiting counsel review</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
              <span className="text-xs font-medium text-slate-400">High Risk Clauses</span>
              <p className="text-2xl font-bold text-rose-400 mt-2">
                {documents.filter((d) => (d.overallRiskScore || 0) >= 70).length}
              </p>
              <span className="text-[11px] text-rose-400">Requires redlining</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
              <span className="text-xs font-medium text-slate-400">Completed Audits</span>
              <p className="text-2xl font-bold text-emerald-400 mt-2">12</p>
              <span className="text-[11px] text-emerald-400">Certified opinions issued</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm">
              <span className="text-xs font-medium text-slate-400">Avg. Turnaround Time</span>
              <p className="text-2xl font-bold text-indigo-400 mt-2">1.8 hrs</p>
              <span className="text-[11px] text-slate-500">Accelerated by AI parsing</span>
            </div>
          </div>

          {/* Review Queue */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Contracts Review Queue</h2>
                <p className="text-xs text-slate-400">Audit automated AI risk scores and provide legal comments</p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">Review Queue Clear</h3>
                <p className="text-xs text-slate-400 mt-1">
                  There are no contracts currently pending lawyer review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-3 font-medium">Contract Title</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Risk Score</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date Uploaded</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 pr-3 font-medium text-white max-w-xs truncate">
                          {doc.title || doc.originalFileName}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-300">
                            {doc.contractType || 'CONTRACT'}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 font-semibold">
                          {doc.overallRiskScore !== undefined && doc.overallRiskScore !== null
                            ? `${doc.overallRiskScore} / 100`
                            : 'Pending'}
                        </td>
                        <td className="py-3.5 pr-3">
                          <RiskBadge risk={doc.status} />
                        </td>
                        <td className="py-3.5 pr-3 text-slate-400">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/lawyer/review/${doc.id}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md shadow-indigo-600/20"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review & Redline
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
