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
  Edit3,
  Download
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
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
  const [lawyerRiskLevel, setLawyerRiskLevel] = useState('LOW');
  const [lawyerNotes, setLawyerNotes] = useState('');
  const [lawyerRecommendations, setLawyerRecommendations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadContractForReview() {
      try {
        setLoading(true);
        const [docRes, analysisRes] = await Promise.all([
          documentService.getDocument(id).catch((err) => {
            console.warn('Could not fetch document details:', err);
            return null;
          }),
          analysisService.getAnalysisByDocument(id).catch((err) => {
            console.warn('Could not fetch analysis details:', err);
            return null;
          }),
        ]);
        let docData = docRes?.data?.data || docRes?.data || null;
        let analysisData = analysisRes?.data?.data || analysisRes?.data || null;

        if (!docData) {
          const queueRes = await lawyerService.getPendingReviews().catch(() => null);
          const queueList = queueRes?.data?.data?.content || queueRes?.data?.content || queueRes?.data?.data || [];
          const found = (Array.isArray(queueList) ? queueList : []).find(d => String(d.id) === String(id));
          if (found) docData = found;
        }

        if (docData) {
          setDocument(docData);
          if (docData.lawyerNotes) setLawyerNotes(docData.lawyerNotes);
          if (docData.lawyerRecommendations) setLawyerRecommendations(docData.lawyerRecommendations);
          if (docData.lawyerRiskLevel) setLawyerRiskLevel(docData.lawyerRiskLevel.toUpperCase());
        }

        if (analysisData) {
          setAnalysis(analysisData);
          setClauses(analysisData.clauses || []);
        } else {
          const clausesRes = await analysisService.getClauses(id).catch(() => null);
          const clList = clausesRes?.data?.data || clausesRes?.data || [];
          if (Array.isArray(clList) && clList.length > 0) {
            setClauses(clList);
          }
        }
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
        riskLevel: lawyerRiskLevel,
        notes: lawyerNotes,
        recommendations: lawyerRecommendations,
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
    <DashboardLayout portalType="lawyer" title="Review Document">
      <div className="space-y-6">
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
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {document?.contractType || 'CONTRACT'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Original: {document?.originalFileName || document?.originalFilename}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => documentService.downloadDocument(id, document?.originalFileName || document?.originalFilename || 'contract.pdf')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 border border-slate-700 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Original Contract
                    </button>
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
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm lg:sticky lg:top-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-purple-400" />
                      Client Contract Review &amp; Certification
                    </h3>
                  </div>

                  {/* AI Baseline vs Independent Counsel Notice */}
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                    <span className="font-semibold block mb-0.5">AI Baseline Risk: {analysis?.riskLevel || 'LOW'} ({analysis?.riskScore || 0}/100)</span>
                    <span className="text-[11px] text-slate-400">
                      You must independently inspect the document and select your own counsel risk assessment below.
                    </span>
                  </div>

                  {savedSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Legal memorandum submitted and client notified!</span>
                    </div>
                  )}

                  <form onSubmit={handleCompleteReview} className="space-y-4">
                    {/* Independent Risk Assessment Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        1. Independent Counsel Risk Assessment *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setLawyerRiskLevel('LOW')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                            lawyerRiskLevel === 'LOW'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          LOW RISK
                        </button>
                        <button
                          type="button"
                          onClick={() => setLawyerRiskLevel('MEDIUM')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                            lawyerRiskLevel === 'MEDIUM'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          MEDIUM RISK
                        </button>
                        <button
                          type="button"
                          onClick={() => setLawyerRiskLevel('HIGH')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                            lawyerRiskLevel === 'HIGH'
                              ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          HIGH RISK
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        2. Counsel Legal Opinion &amp; Analysis *
                      </label>
                      <textarea
                        value={lawyerNotes}
                        onChange={(e) => setLawyerNotes(e.target.value)}
                        rows={5}
                        placeholder="Detail your independent findings, contractual exposure, liability concerns, and legal commentary..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        3. Actionable Recommendations &amp; Redlines
                      </label>
                      <textarea
                        value={lawyerRecommendations}
                        onChange={(e) => setLawyerRecommendations(e.target.value)}
                        rows={4}
                        placeholder="Specific clause changes to demand, indemnity caps, jurisdiction modifications, etc..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Formal Counsel Attestation
                      </div>
                      <p>
                        Submitting this audit sends real-time certification to the client with your independent evaluation.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !lawyerNotes.trim()}
                      className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {submitting ? 'Certifying Review...' : 'Certify & Deliver Review to Client'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
    </DashboardLayout>
  );
}
