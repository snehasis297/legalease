import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Sparkles, Copy, Check } from 'lucide-react';
import RiskBadge from './RiskBadge';

export const ClauseCard = ({ clause }) => {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const isHigh = clause.riskLevel === 'HIGH';

  const copySuggestion = () => {
    if (clause.suggestion) {
      navigator.clipboard.writeText(clause.suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-2xl transition-all ${
        isHigh
          ? 'glass-card border-2 border-danger shadow-glow-danger'
          : 'glass-card border border-white/10 hover:border-white/20'
      } overflow-hidden`}
    >
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 flex items-center justify-between cursor-pointer bg-card/60 hover:bg-card select-none"
      >
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-accent">
            #{clause.clauseNumber}
          </span>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              {clause.clauseType || 'General Provision'}
            </h4>
            <p className="text-xs text-textSecondary truncate max-w-md hidden sm:block">
              {clause.clauseText}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <RiskBadge level={clause.riskLevel} />
          {expanded ? <ChevronUp className="w-4 h-4 text-textSecondary" /> : <ChevronDown className="w-4 h-4 text-textSecondary" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-5 border-t border-white/10 space-y-4 text-xs sm:text-sm">
          {/* Original Clause Text */}
          <div>
            <span className="text-xs uppercase font-mono text-textSecondary tracking-wider block mb-1">
              Original Agreement Text:
            </span>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-gray-300 leading-relaxed italic">
              "{clause.clauseText}"
            </div>
          </div>

          {/* Legal AI Explanation */}
          <div>
            <span className="text-xs uppercase font-mono text-accent tracking-wider block mb-1">
              Risk Assessment &amp; Legal Implications:
            </span>
            <p className="text-xs text-textSecondary leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
              {clause.explanation}
            </p>
          </div>

          {/* Redline Recommendation / Alternate Suggestion */}
          {clause.suggestion && (
            <div className="p-4 rounded-xl bg-primary/20 border border-primary/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-accent font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommended Redline / Alternate Wording:</span>
                </div>
                <button
                  onClick={copySuggestion}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-black/40 hover:bg-black/70 text-[11px] text-textSecondary hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-white leading-relaxed font-mono">
                {clause.suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClauseCard;
