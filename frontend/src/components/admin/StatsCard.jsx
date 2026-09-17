import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, change, color = 'primary' }) => {
  const colorMap = {
    primary: 'border-primary/40 text-primary-light shadow-glow-purple',
    accent: 'border-accent/40 text-accent shadow-glow-cyan',
    danger: 'border-danger/40 text-danger shadow-glow-danger',
    success: 'border-success/40 text-success',
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-medium text-textSecondary uppercase tracking-wider">{title}</span>
        <div className="text-2xl sm:text-3xl font-bold font-mono text-white">{value}</div>
        {change && <span className="text-xs text-textSecondary">{change}</span>}
      </div>

      <div className={`w-12 h-12 rounded-xl bg-white/5 border flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatsCard;
