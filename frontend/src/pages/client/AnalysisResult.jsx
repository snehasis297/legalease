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
import DashboardLayout from '../../components/layout/DashboardLayout';
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
      const [docRes, analysisRes] = await Promise.allSettled([
        documentService.getDocument(id),
        analysisService.getAnalysisByDocument(id),
      ]);
      if (docRes.status === 'fulfilled') {
        setDocument(docRes.value.data?.data || docRes.value.data);
      }
      if (analysisRes.status === 'fulfilled') {
        const aData = analysisRes.value.data?.data || analysisRes.value.data;
        setAnalysis(aData);
        setClauses(aData?.clauses || []);
      }
    } catch (err) {
      console.error('Failed to load analysis:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Poll every 2.5s if analysis is not yet available
    const interval = setInterval(async () => {
      try {
        const res = await analysisService.getAnalysisByDocument(id);
        const aData = res.data?.data || res.data;
        if (aData && (aData.riskScore !== undefined || aData.clauses?.length)) {
          setAnalysis(aData);
          setClauses(aData.clauses || []);
          clearInterval(interval);
        }
      } catch (_) {
        // Still processing
      }
    }, 2500);

    return () => clearInterval(interval);
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
    <DashboardLayout portalType="client" title="Contract Analysis">
      <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate('/client/documents')}
              className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600 font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Documents
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={refreshing}
                className="p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm transition"
                title="Refresh Analysis"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleExportReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-sm text-xs font-medium transition"
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
              <div className="card grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-600/10 text-indigo-700 border border-indigo-500/20">
                      {document?.contractType || 'CONTRACT'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Uploaded on {formatDate(document?.createdAt || document?.uploadTime)}
                    </span>
                  </div>

                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    {document?.title || document?.originalFileName || document?.originalFilename || 'Contract Risk Assessment'}
                  </h1>

                  <div className="p-4 rounded-xl bg-white/70 border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Executive Summary
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {analysis?.fullSummary || analysis?.summary || 'Analysis indicates standard terms with several clauses requiring strategic review. Review highlighted liabilities and indemnity obligations below.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-white/60 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600 mb-3">Overall Contract Threat Index</span>
                  <RiskGauge score={analysis?.riskScore ?? analysis?.overallRiskScore ?? document?.overallRiskScore ?? 0} />
                  <span className="text-xs text-slate-500 mt-3 font-mono">
                    Deterministic + Claude 3.5 Engine
                  </span>
                </div>
              </div>

              {/* Combined Final Risk Status Banner */}
              {(() => {
                const aiLevel = (analysis?.riskLevel || (analysis?.riskScore >= 60 ? 'HIGH' : analysis?.riskScore >= 30 ? 'MEDIUM' : 'LOW')).toUpperCase();
                const lawyerLevel = (document?.lawyerRiskLevel || analysis?.lawyerRiskLevel || '').toUpperCase();
                const isReviewed = document?.reviewStatus === 'REVIEWED' || analysis?.reviewStatus === 'REVIEWED' || Boolean(lawyerLevel);

                let bannerBg = 'bg-sky-500/10 border-sky-500/30 text-sky-300';
                let icon = <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />;
                let title = 'AI Assessed – Awaiting Lawyer Certification';
                let subtitle = 'The AI automated scan is complete. This contract is now active in the lawyer portal for independent review.';

                if (isReviewed) {
                  if (aiLevel === 'LOW' && lawyerLevel === 'LOW') {
                    bannerBg = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-glow-emerald';
                    icon = <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />;
                    title = 'Low Risk – Reviewed by AI and Lawyer';
                    subtitle = 'Both AI automated analysis and independent legal counsel have verified all clauses and determined this contract to be Low Risk.';
                  } else if (aiLevel === 'HIGH' || lawyerLevel === 'HIGH') {
                    bannerBg = 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-glow-rose';
                    icon = <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />;
                    title = 'High Risk – Action Required';
                    subtitle = 'Critical risk terms or severe exposure identified. Review counsel redline directives before executing this document.';
                  } else {
                    bannerBg = 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-glow-amber';
                    icon = <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />;
                    title = 'Medium Risk – Caution Advised';
                    subtitle = 'Moderate hazards detected. Counsel recommends amending highlighted termination or liability terms.';
                  }
                }

                return (
                  <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${bannerBg}`}>
                    <div className="flex items-start sm:items-center gap-3.5">
                      {icon}
                      <div>
                        <h2 className="text-base font-bold tracking-tight">{title}</h2>
                        <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{subtitle}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-black/30 border border-white/10 shrink-0">
                      {isReviewed ? 'Certified Review' : 'AI Processing Only'}
                    </span>
                  </div>
                );
              })()}

              {/* Dedicated Comparison: AI Analysis vs Lawyer Review */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Assessment Panel */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Automated Analysis</h3>
                    </div>
                    <RiskBadge level={analysis?.riskLevel || (analysis?.riskScore >= 60 ? 'HIGH' : analysis?.riskScore >= 30 ? 'MEDIUM' : 'LOW')} />
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Risk Assessment Score:</span>
                      <span className="font-mono font-bold text-white">{analysis?.riskScore ?? document?.overallRiskScore ?? 0} / 100</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Clauses Analyzed:</span>
                      <span className="font-mono text-white">{clauses.length} Provisions</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">AI Evaluation Engine:</span>
                      <span className="font-mono text-indigo-300">Claude 3.5 + Hybrid Rules</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-indigo-400 block mb-1">AI Findings &amp; Summary:</span>
                    {analysis?.fullSummary || analysis?.summary || 'Standard contract patterns detected across indemnity and confidentiality clauses.'}
                  </div>
                </div>

                {/* Lawyer Independent Review Panel */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lawyer Independent Review</h3>
                    </div>
                    {document?.lawyerRiskLevel || analysis?.lawyerRiskLevel ? (
                      <RiskBadge level={document?.lawyerRiskLevel || analysis?.lawyerRiskLevel} />
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        PENDING
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Assigned Counsel:</span>
                      <span className="font-semibold text-white">
                        {document?.assignedLawyerName || analysis?.assignedLawyerName || 'Advocate Sarah Jenkins'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Audit Status:</span>
                      <span className={`font-mono font-medium ${
                        document?.reviewStatus === 'REVIEWED' || analysis?.reviewStatus === 'REVIEWED' || document?.lawyerNotes
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}>
                        {document?.reviewStatus === 'REVIEWED' || analysis?.reviewStatus === 'REVIEWED' || document?.lawyerNotes
                          ? 'CERTIFIED REVIEW COMPLETED'
                          : 'IN COUNSEL QUEUE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                      <span className="text-slate-400">Certification Time:</span>
                      <span className="font-mono text-slate-300">
                        {document?.lawyerReviewedAt ? formatDate(document.lawyerReviewedAt) : 'Pending certification'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                    <div>
                      <span className="font-semibold text-purple-400 block mb-1">Counsel Legal Assessment:</span>
                      {document?.lawyerNotes || analysis?.lawyerNotes ? (
                        <p>{document?.lawyerNotes || analysis?.lawyerNotes}</p>
                      ) : (
                        <p className="text-slate-500 italic">
                          Assigned lawyer is actively reviewing this contract. Legal opinion and redline directives will appear here upon completion.
                        </p>
                      )}
                    </div>

                    {(document?.lawyerRecommendations || analysis?.lawyerRecommendations) && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="font-semibold text-emerald-400 block mb-1">Actionable Recommendations:</span>
                        <p className="text-slate-200">{document?.lawyerRecommendations || analysis?.lawyerRecommendations}</p>
                      </div>
                    )}
                  </div>
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
        </div>
    </DashboardLayout>
  );
}
