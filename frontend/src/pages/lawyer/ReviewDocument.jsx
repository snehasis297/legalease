import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Scale, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  FileText, 
  ShieldCheck,
  Edit3
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import RiskBadge from '../../components/analysis/RiskBadge';
import RiskGauge from '../../components/analysis/RiskGauge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import documentService from '../../services/documentService';
import analysisService from '../../services/analysisService';
import lawyerService from '../../services/lawyerService';

export default function ReviewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lawyerNotes, setLawyerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadContractForReview() {
      try {
        setLoading(true);
        const [docRes, analysisRes] = await Promise.all([
          documentService.getDocument(id),
          analysisService.getAnalysisByDocument(id),
        ]);
        setDocument(docRes.data);
        setAnalysis(analysisRes.data);
        setClauses(analysisRes.data?.clauses || []);
      } catch (err) {
        console.error('Failed to load contract for review:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContractForReview();
  }, [id]);

  const handleCompleteReview = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await lawyerService.submitReview(id, {
        notes: lawyerNotes,
        status: 'REVIEWED',
      });
      setSavedSuccess(true);
      setTimeout(() => {
        navigate('/lawyer/dashboard');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit lawyer opinion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate('/lawyer/dashboard')}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Counsel Queue
            </button>

            <Link
              to={`/client/chat/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Open AI Research Assistant
            </Link>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Document Overview & Extracted Clauses */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {document?.contractType || 'CONTRACT'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Original: {document?.originalFileName}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-white mb-2">
                    {document?.title || document?.originalFileName}
                  </h1>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="font-semibold text-indigo-400 block mb-1">AI Executive Summary:</span>
                    {analysis?.summary || 'Standard agreement analyzed. See clause breakdown below for liabilities.'}
                  </p>
                </div>

                {/* Clauses list */}
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Clauses Extracted ({clauses.length})
                  </h2>

                  {clauses.map((clause, idx) => (
                    <div
                      key={clause.id || idx}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">
                          Clause {idx + 1}: {clause.title || clause.category || 'Contract Provision'}
                        </span>
                        <RiskBadge risk={clause.riskLevel} />
                      </div>

                      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 font-serif text-xs text-slate-300 leading-relaxed">
                        "{clause.content || clause.clauseText}"
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <p>
                          <span className="text-rose-400 font-medium">Risk Factor: </span>
                          {clause.riskExplanation || clause.reason || 'Standard wording.'}
                        </p>
                        {clause.suggestedRevision && (
                          <p>
                            <span className="text-emerald-400 font-medium">AI Redline: </span>
                            {clause.suggestedRevision}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Counsel Opinion & Sign-off */}
              <div className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm sticky top-6 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-400" />
                    Counsel Legal Memorandum
                  </h3>

                  <div className="flex justify-center py-2">
                    <RiskGauge score={analysis?.overallRiskScore || document?.overallRiskScore || 0} />
                  </div>

                  {savedSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Legal memorandum submitted successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleCompleteReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Counsel Opinion & Redline Directives *
                      </label>
                      <textarea
                        value={lawyerNotes}
                        onChange={(e) => setLawyerNotes(e.target.value)}
                        rows={8}
                        placeholder="Provide your professional legal assessment, recommended contract adjustments, and risk mitigations for the client..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Formal Counsel Attestation
                      </div>
                      <p>
                        Submitting this audit certifies your Bar Council endorsement on this contract review.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !lawyerNotes.trim()}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {submitting ? 'Certifying Review...' : 'Certify & Deliver to Client'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
