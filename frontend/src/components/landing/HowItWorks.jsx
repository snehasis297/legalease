import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { UploadCloud, Cpu, MessageSquareText } from 'lucide-react';

export const HowItWorks = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const steps = [
    {
      number: '01',
      title: 'Upload Contract',
      description: 'Drag & drop PDF or DOCX agreements. Files are cryptographically verified via magic bytes and encrypted instantly with AES-256-GCM.',
      icon: UploadCloud,
      color: 'from-blue-500 to-cyan-400',
    },
    {
      number: '02',
      title: 'AI Clause Extraction & Risk Scoring',
      description: 'Our engine segments every clause, calculates 0-100 risk scores, and detects one-sided liabilities, uncapped risks, and non-compete traps.',
      icon: Cpu,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      number: '03',
      title: 'Real-Time Document Chat & Redlines',
      description: 'Interrogate the contract via an SSE-streamed AI lawyer chatbot. Receive suggested redlines and assign verified attorneys for certified review.',
      icon: MessageSquareText,
      color: 'from-accent to-emerald-400',
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-24 relative bg-[#07070D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-xs uppercase tracking-widest text-accent font-mono mb-2 font-semibold">
            Simple 3-Step Pipeline
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How LegalEase Protects You
          </p>
          <p className="text-textSecondary text-base mt-4">
            Autonomous contract intelligence without manual reading marathons.
          </p>
        </div>

        <div className="relative">
          {/* Animated Dashed Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-primary/30 -translate-y-12 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="glass-card p-8 rounded-2xl border border-white/10 hover:border-accent/40 transition-all group hover:-translate-y-2 relative"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-card border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-purple">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <span className="text-3xl font-black font-mono text-white/20 group-hover:text-accent/40 transition-colors">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    {step.description}
                  </p>
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
