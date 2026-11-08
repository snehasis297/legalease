import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, change, color = 'indigo' }) => {
  const colorMap = {
    primary: 'border-indigo-500/50 text-indigo-400 bg-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    indigo: 'border-indigo-500/50 text-indigo-400 bg-indigo-500/15 shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    accent: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    cyan: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    danger: 'border-rose-500/50 text-rose-400 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    rose: 'border-rose-500/50 text-rose-400 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    amber: 'border-amber-500/50 text-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    warning: 'border-amber-500/50 text-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    success: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    emerald: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    purple: 'border-purple-500/50 text-purple-400 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    blue: 'border-blue-500/50 text-blue-400 bg-blue-500/15 shadow-[0_0_15px_rgba(59,130,246,0.25)]',
  };

  const activeColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/70 hover:border-slate-600 transition-all shadow-md flex items-center justify-between min-w-0">
      <div className="space-y-1 min-w-0 pr-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block truncate">{title}</span>
        <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">{value}</div>
        {change && <span className="text-xs font-medium text-slate-300 block truncate">{change}</span>}
      </div>

      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${activeColor}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatsCard;
