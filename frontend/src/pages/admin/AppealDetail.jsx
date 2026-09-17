import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Download, 
  ShieldCheck 
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import AdminSidebar from '../../components/layout/AdminSidebar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import appealService from '../../services/appealService';
import { formatDate } from '../../utils/formatters';

export default function AppealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadAppeal = async () => {
    try {
      setLoading(true);
      const res = await appealService.getAppeal(id);
      setAppeal(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appeal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppeal();
  }, [id]);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      setError('');
      await appealService.approveAppeal(id);
      setSuccess('Appeal approved. User account restored to ACTIVE status and confirmation email sent.');
      loadAppeal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve appeal.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setProcessing(true);
      setError('');
      await appealService.rejectAppeal(id, { reason: rejectionReason });
      setShowRejectModal(false);
      setSuccess('Appeal rejected. Deactivation decision upheld and notification dispatched.');
      loadAppeal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject appeal.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
          <button
            onClick={() => navigate('/admin/appeals')}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Appeals List
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
          ) : appeal ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      ACCOUNT RESTORATION PETITION
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        appeal.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : appeal.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {appeal.status || 'PENDING'}
                    </span>
                  </div>

                  <h1 className="text-xl font-bold text-white">
                    {appeal.user?.fullName || appeal.fullName || 'Appellant'}
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">
                    {appeal.user?.email || appeal.email}
                  </p>
                </div>

                {appeal.status === 'PENDING' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Appeal
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Restore Account
                    </button>
                  </div>
                )}
              </div>

              {/* Appeal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <h2 className="text-sm font-semibold text-white">Appellant Statement</h2>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {appeal.reason}
                  </div>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Filed On</span>
                      <span className="text-slate-300">{formatDate(appeal.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Original Deactivation Trigger</span>
                      <span className="text-rose-400 font-medium">
                        {appeal.disableReason || 'Heuristic threat / admin override'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <h2 className="text-sm font-semibold text-white">Attached Identity Evidence</h2>

                  {appeal.documentUrl ? (
                    <div className="p-6 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center text-center space-y-3">
                      <FileText className="w-12 h-12 text-indigo-400" />
                      <p className="text-xs text-white font-medium">Identity_Verification_Evidence.pdf</p>
                      <a
                        href={appeal.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Evidence File
                      </a>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                      No supplemental document was attached with this appeal.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRejectModal(false)}
          title="Reject Appeal"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              State the reason for rejecting this appeal. The account will remain permanently disabled.
            </p>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Rejection Ground *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Insufficient proof of identity, recurring compliance breach..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
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
                {processing ? 'Upholding ban...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
