import React from 'react';

export const SkeletonCard = ({ lines = 3 }) => {
  return (
    <div className="glass-card p-6 border border-white/10 rounded-xl space-y-4 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-1/3"></div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 bg-white/5 rounded w-full"></div>
        ))}
      </div>
      <div className="h-4 bg-white/10 rounded w-1/4 pt-2"></div>
    </div>
  );
};

export default SkeletonCard;
