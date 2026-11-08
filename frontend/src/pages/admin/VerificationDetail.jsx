import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Scale, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  ShieldCheck 
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';

export default function VerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const [documents, setDocuments] = useState([]);

  const loadVerification = async () => {
    try {
      setLoading(true);
      const res = await adminService.getVerification(id);
      const data = res.data?.data || res.data;
      setVerification(data);

      try {
        const docRes = await adminService.getLawyerDocuments(id);
        const docList = docRes.data?.data || docRes.data;
        if (Array.isArray(docList)) setDocuments(docList);
      } catch (docErr) {
        // Document fetch is supplementary
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load verification details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
  }, [id]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      setError('');
      await adminService.approveVerification(id);
      setSuccess('Lawyer Bar Council credentials approved. Verification badge and counsel permissions granted.');
      loadVerification();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve verification.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setProcessing(true);
      setError('');
      await adminService.rejectVerification(id, { reason: rejectionReason });
      setShowRejectModal(false);
      setSuccess('Verification rejected. Explanatory notification dispatched to applicant.');
      loadVerification();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject verification.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout portalType="admin" title="Verification Detail">
      <div className="space-y-6">
          <button
            onClick={() => navigate('/admin/verifications')}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : verification ? (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      BAR KYC AUDIT
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        verification.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : verification.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {verification.status || 'PENDING'}
                    </span>
                  </div>

                  <h1 className="text-xl font-bold text-white">
                    Adv. {verification.user?.fullName || verification.fullName}
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">
                    {verification.user?.email || verification.email}
                  </p>
                </div>

                {verification.status === 'PENDING' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Credential
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Authorize
                    </button>
                  </div>
                )}
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <h2 className="text-sm font-semibold text-white">Applicant Credentials</h2>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Bar License Number</span>
                      <span className="font-mono text-indigo-300 font-semibold">{verification.barNumber}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Jurisdiction Bar</span>
                      <span className="text-white">{verification.stateBar}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Years of Experience</span>
                      <span className="text-white">{verification.experienceYears || '5'} years</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Specialization</span>
                      <span className="text-white">{verification.practiceArea || 'Commercial Law'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Submission Date</span>
                      <span className="text-slate-300">{formatDate(verification.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <h2 className="text-sm font-semibold text-white">Verification Documents ({documents.length > 0 ? documents.length : 1})</h2>

                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-indigo-400 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-white">
                                {doc.documentType || 'VERIFICATION_DOC'}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {doc.fileName || 'Encrypted File'}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            AES-256-GCM
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center text-center space-y-3">
                      <FileText className="w-12 h-12 text-indigo-400" />
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {verification.documentName || 'Bar_License_Certificate.pdf'}
                        </p>
                        <span className="text-[11px] text-slate-400">Stored in encrypted vault</span>
                      </div>

                      <a
                        href={verification.documentUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download &amp; Inspect Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRejectModal(false)}
          title="Reject Bar Verification"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Please provide the specific ground for rejection (e.g. illegible scan, mismatched state council ID, inactive license status).
            </p>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Explain the deficiency for the applicant..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium transition"
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
