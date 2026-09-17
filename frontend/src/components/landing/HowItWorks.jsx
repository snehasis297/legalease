import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { UploadCloud, Cpu, MessageSquareText, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const HowItWorks = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const { activeSection, setActiveSection, sectionThemeColors } = useTheme();

  const isActive = activeSection === 'how-it-works';
  const theme = sectionThemeColors['how-it-works'];

  const steps = [
    {
      number: '01',
      title: 'Upload Contract',
      description: 'Drag & drop PDF or DOCX agreements. Files are cryptographically verified via magic bytes and encrypted instantly with AES-256-GCM.',
      icon: UploadCloud,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      number: '02',
      title: 'AI Clause Extraction & Risk Scoring',
      description: 'Our engine segments every clause, calculates 0-100 risk scores, and detects one-sided liabilities, uncapped risks, and non-compete traps.',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      number: '03',
      title: 'Real-Time Document Chat & Redlines',
      description: 'Interrogate the contract via an SSE-streamed AI lawyer chatbot. Receive suggested redlines and assign verified attorneys for certified review.',
      icon: MessageSquareText,
      color: 'from-indigo-400 to-emerald-400',
    },
  ];

  return (
    <section 
      id="how-it-works" 
      ref={ref} 
      onClick={() => setActiveSection('how-it-works')}
      className={`py-24 relative transition-all duration-500 cursor-pointer ${
        isActive 
          ? 'bg-gradient-to-b from-indigo-950/40 via-[#07070D] to-[#07070D] ring-2 ring-indigo-500/40 shadow-[0_0_80px_rgba(99,102,241,0.15)]' 
          : 'bg-[#07070D]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          {isActive ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 mb-3 shadow-lg shadow-indigo-500/20 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>ACTIVE INSPECTION: PIPELINE WORKFLOW</span>
            </div>
          ) : (
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-mono mb-2 font-semibold">
              Simple 3-Step Pipeline
            </h2>
          )}
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How LegalEase Protects You
          </p>
          <p className="text-textSecondary text-base mt-4">
            Autonomous contract intelligence without manual reading marathons. Click to inspect this workflow.
          </p>
        </div>

        <div className="relative">
          {/* Animated Dashed Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-indigo-500/30 -translate-y-12 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className={`glass-card p-8 relative flex flex-col justify-between transition-all duration-300 group hover:border-indigo-500/60 ${
                    isActive ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/10' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-3xl font-black text-white/20 group-hover:text-indigo-400 transition-colors">
                        {step.number}
                      </span>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-textSecondary text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center text-xs font-mono text-indigo-400">
                    <span>STEP {idx + 1} OF 3</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
