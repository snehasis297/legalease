import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CtaSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#0A0A0F]">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Production-Ready Enterprise System</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Never Sign an Unchecked Contract Again
        </h2>

        <p className="text-base sm:text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed">
          Join thousands of founders, legal counsels, and procurement leaders using LegalEase to
          mitigate liabilities and accelerate contract executions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-base shadow-glow-purple hover:scale-105 transition-all"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl glass border border-white/15 text-white font-semibold text-base hover:bg-white/5 transition-all"
          >
            Client / Lawyer Login
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
