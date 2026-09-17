import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AppealExpired() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-8 shadow-2xl relative z-10 text-center">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-rose-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Appeal Window Expired</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          The 30-day window to submit an appeal for this disabled account has elapsed. 
          Under our automated compliance policies, expired tokens can no longer be processed online.
        </p>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left mb-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              For manual record review or legal data retrieval requests, please contact our compliance desk directly at{' '}
              <span className="text-indigo-400 font-mono">compliance@legalease.com</span>.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition text-sm gap-2"
        >
          Return to Homepage
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
