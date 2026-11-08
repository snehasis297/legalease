import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Scale, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import lawyerService from '../../services/lawyerService';
import { formatDate } from '../../utils/formatters';

export default function KycStatus() {
  const navigate = useNavigate();

  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await lawyerService.getKycStatus();
      setKycData(res.data);
    } catch (err) {
      console.error('Failed to load KYC status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const status = (kycData?.status || 'PENDING').toUpperCase();

  return (
    <DashboardLayout portalType="lawyer" title="Bar Verification Status">
      <div className="max-w-2xl mx-auto space-y-6">
            <button
              onClick={() => navigate('/lawyer/dashboard')}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">Bar Verification Status</h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time tracking of your professional legal credential verification.
              </p>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-xl text-center space-y-6">
                {status === 'APPROVED' ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Bar Credentials Verified</h2>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your Bar Council enrollment has been confirmed. You hold full counsel privileges including contract redlining and client legal advice.
                    </p>
                  </div>
                ) : status === 'REJECTED' ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                      <XCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Verification Rejected</h2>
                    <p className="text-xs text-rose-300 max-w-md mx-auto">
                      {kycData?.rejectionReason || 'The provided bar registration certificate could not be validated against bar directory records.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                      <Clock className="w-8 h-8 animate-pulse" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Verification In Review</h2>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Your submitted Bar Council credentials are being audited by our compliance administrators. Verification typically takes less than 24 hours.
                    </p>
                  </div>
                )}

                {/* Metadata Details */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Bar License Number:</span>
                    <span className="font-mono text-white">{kycData?.barNumber || 'Pending Submission'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Jurisdiction Bar:</span>
                    <span className="text-white">{kycData?.stateBar || 'Pending Submission'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Submission Date:</span>
                    <span className="text-white">{formatDate(kycData?.submittedAt || new Date().toISOString())}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Current Status:</span>
                    <span className={`font-semibold ${
                      status === 'APPROVED' ? 'text-emerald-400' : status === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={fetchStatus}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Status
                  </button>

                  {status === 'REJECTED' ? (
                    <Link
                      to="/lawyer/kyc-upload"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-lg shadow-indigo-600/20"
                    >
                      Re-submit Verification
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to="/lawyer/dashboard"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-lg shadow-indigo-600/20"
                    >
                      Counsel Dashboard
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
    </DashboardLayout>
  );
}
