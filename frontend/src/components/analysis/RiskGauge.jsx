import React from 'react';
import { motion } from 'framer-motion';

export const RiskGauge = ({ score = 0, level = 'LOW', size = 180 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 60 || level === 'HIGH') return '#FF3355';
    if (score >= 30 || level === 'MEDIUM') return '#FFAA00';
    return '#00FF88';
  };

  const strokeColor = getColor();

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated score arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-black text-white font-mono">{score}</span>
        <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5" style={{ color: strokeColor }}>
          {level} RISK
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
