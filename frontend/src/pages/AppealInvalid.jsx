import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowRight } from 'lucide-react';

export default function AppealInvalid() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-8 shadow-2xl relative z-10 text-center">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertOctagon className="w-8 h-8 text-rose-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Invalid Appeal Link</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          The appeal token in your URL is invalid, tampered with, or has already been used to file a decision. 
          Please ensure you opened the exact link sent to your registered email address.
        </p>

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
