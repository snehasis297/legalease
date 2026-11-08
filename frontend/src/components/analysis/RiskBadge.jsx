import React from 'react';

export const RiskBadge = ({ level, risk, score }) => {
  let computedLevel = (level || risk || '').toUpperCase();

  // If score is provided or computedLevel is not a standard risk, calculate from score
  const numericScore = typeof score === 'number' ? score : (typeof risk === 'number' ? risk : null);
  if (numericScore !== null) {
    if (numericScore >= 60) computedLevel = 'HIGH';
    else if (numericScore >= 30) computedLevel = 'MEDIUM';
    else computedLevel = 'LOW';
  } else if (!['HIGH', 'MEDIUM', 'LOW'].includes(computedLevel)) {
    // If it's a status like 'DONE', 'PROCESSING', etc.
    if (computedLevel === 'PROCESSING' || computedLevel === 'PENDING') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse">
          ANALYZING...
        </span>
      );
    }
  }

  if (computedLevel === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs">
        HIGH RISK
      </span>
    );
  }

  if (computedLevel === 'MEDIUM') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
        MEDIUM RISK
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
      LOW RISK
    </span>
  );
};

export default RiskBadge;
