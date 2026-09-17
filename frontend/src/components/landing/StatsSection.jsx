import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

export const StatsSection = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  const stats = [
    { value: 12000, suffix: '+', label: 'Contracts Scanned' },
    { value: 98, suffix: '%', label: 'Average Risk Detection Rate' },
    { value: 85, suffix: '%', label: 'Faster Legal Review Turnaround' },
    { value: 0, suffix: ' ms', label: 'Zero Plaintext Exposure' },
  ];

  return (
    <section ref={ref} className="py-20 relative bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 border-y border-primary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {inView ? <CountUp end={item.value} duration={2.5} separator="," /> : '0'}
                <span>{item.suffix}</span>
              </div>
              <p className="text-sm font-medium text-white/80">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
