import React from 'react';

export const RiskBadge = ({ level = 'LOW' }) => {
  const norm = level?.toUpperCase() || 'LOW';

  if (norm === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-danger/20 text-danger border border-danger/40 animate-pulse">
        HIGH RISK
      </span>
    );
  }

  if (norm === 'MEDIUM') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/20 text-warning border border-warning/40">
        MEDIUM RISK
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/20 text-success border border-success/40">
      LOW RISK
    </span>
  );
};

export default RiskBadge;
