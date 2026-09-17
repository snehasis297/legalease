import React from 'react';
import { calculatePasswordStrength } from '../../utils/validators';

export const PasswordStrength = ({ password = '' }) => {
  const { score, label, color } = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-textSecondary">Password Strength:</span>
        <span className="font-semibold text-white">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 h-1.5">
        <div className={`rounded-full transition-all ${score >= 1 ? color : 'bg-white/10'}`} />
        <div className={`rounded-full transition-all ${score >= 2 ? color : 'bg-white/10'}`} />
        <div className={`rounded-full transition-all ${score >= 3 ? color : 'bg-white/10'}`} />
      </div>
    </div>
  );
};

export default PasswordStrength;
