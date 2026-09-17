import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  MessageSquare, 
  ArrowLeft, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  RefreshCw,
  Scale
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import RiskGauge from '../../components/analysis/RiskGauge';
import RiskBadge from '../../components/analysis/RiskBadge';
import ClauseCard from '../../components/analysis/ClauseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import analysisService from '../../services/analysisService';
import documentService from '../../services/documentService';
import { formatDate } from '../../utils/formatters';

export default function AnalysisResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [docRes, analysisRes] = await Promise.all([
        documentService.getDocument(id),
        analysisService.getAnalysisByDocument(id),
      ]);
      setDocument(docRes.data);
      setAnalysis(analysisRes.data);
      setClauses(analysisRes.data?.clauses || []);
    } catch (err) {
      console.error('Failed to load analysis:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleExportReport = () => {
    window.print();
  };

  const highRiskCount = clauses.filter((c) => (c.riskLevel || '').toUpperCase() === 'HIGH' || (c.riskLevel || '').toUpperCase() === 'CRITICAL').length;
  const mediumRiskCount = clauses.filter((c) => (c.riskLevel || '').toUpperCase() === 'MEDIUM').length;
  const lowRiskCount = clauses.filter((c) => (c.riskLevel || '').toUpperCase() === 'LOW').length;

  const filteredClauses = clauses.filter((c) => {
    if (filterRisk === 'ALL') return true;
    return (c.riskLevel || '').toUpperCase() === filterRisk;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate('/client/documents')}
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Documents
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={refreshing}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                title="Refresh Analysis"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExportReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export Report
              </button>
              <Link
                to={`/client/chat/${id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-lg shadow-indigo-600/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Claude AI
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Document Overview Header */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 backdrop-blur-sm shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {document?.contractType || 'CONTRACT'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Uploaded on {formatDate(document?.createdAt)}
                    </span>
                  </div>

                  <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                    {document?.title || document?.originalFileName || 'Contract Risk Assessment'}
                  </h1>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Executive Summary
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis?.summary || 'Analysis indicates standard terms with several clauses requiring strategic review. Review highlighted liabilities and indemnity obligations below.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                  <span className="text-xs font-medium text-slate-400 mb-3">Overall Contract Threat Index</span>
                  <RiskGauge score={analysis?.overallRiskScore || document?.overallRiskScore || 0} />
                  <span className="text-xs text-slate-400 mt-3 font-mono">
                    Deterministic + Claude 3.5 Engine
                  </span>
                </div>
              </div>

              {/* Clause Breakdown Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-rose-500/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">High Risk Provisions</span>
                    <p className="text-xl font-bold text-white">{highRiskCount}</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Medium Risk Terms</span>
                    <p className="text-xl font-bold text-white">{mediumRiskCount}</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Standard / Low Risk</span>
                    <p className="text-xl font-bold text-white">{lowRiskCount}</p>
                  </div>
                </div>
              </div>

              {/* Clauses Analysis Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Extracted Clauses & Recommendations</h2>
                    <p className="text-xs text-slate-400">
                      Clauses analyzed against our 10-point threat framework with AI redline suggestions.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400">Filter:</span>
                    <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs">
                      {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setFilterRisk(lvl)}
                          className={`px-3 py-1 rounded-md transition font-medium text-[11px] ${
                            filterRisk === lvl
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {filteredClauses.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-white">No clauses match this filter</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Try selecting another filter or view all clauses.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredClauses.map((clause, idx) => (
                      <ClauseCard key={clause.id || idx} clause={clause} index={idx + 1} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
