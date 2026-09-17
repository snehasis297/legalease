import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-3">
      <Loader2 className={`${sizeClass} text-accent animate-spin`} />
      {text && <p className="text-sm text-textSecondary font-medium tracking-wide">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
