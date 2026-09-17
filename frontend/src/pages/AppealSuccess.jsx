import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AppealSuccess() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 shadow-2xl relative z-10 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Appeal Submitted</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Your appeal and supporting documentation have been received securely. 
          Our security & compliance team will manually audit your case within 24 to 48 hours.
        </p>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              You will receive automated email notifications at your registered address whenever an administrator reviews or decisions your appeal.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition text-sm gap-2 shadow-lg shadow-indigo-500/20"
        >
          Return to LegalEase
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
