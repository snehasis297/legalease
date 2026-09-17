import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Sparkles, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const StatsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const { activeSection, setActiveSection } = useTheme();
  const isActive = activeSection === 'stats';

  const stats = [
    { value: 12000, suffix: '+', label: 'Contracts Scanned' },
    { value: 98, suffix: '%', label: 'Average Risk Detection Rate' },
    { value: 85, suffix: '%', label: 'Faster Legal Review Turnaround' },
    { value: 0, suffix: ' ms', label: 'Zero Plaintext Exposure' },
  ];

  return (
    <section 
      id="stats"
      ref={ref}
      onClick={() => setActiveSection('stats')}
      className={`py-20 relative transition-all duration-500 cursor-pointer ${
        isActive
          ? 'bg-gradient-to-r from-cyan-950/60 via-cyan-900/40 to-cyan-950/60 border-y-2 border-cyan-400 shadow-[0_0_80px_rgba(6,182,212,0.2)]'
          : 'bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 border-y border-primary/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isActive && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-mono shadow-lg shadow-cyan-500/20 animate-pulse">
              <Activity className="w-3.5 h-3.5" />
              <span>ACTIVE INSPECTION: GLOBAL ENTERPRISE TELEMETRY</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight transition-colors ${
                isActive ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'text-white'
              }`}>
                {inView ? <CountUp end={item.value} duration={2.5} separator="," /> : '0'}
                <span>{item.suffix}</span>
              </div>
              <p className={`text-sm font-medium transition-colors ${
                isActive ? 'text-cyan-100/90 font-semibold' : 'text-white/80'
              }`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
