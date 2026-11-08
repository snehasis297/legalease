import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  FileText, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  Search,
  Scale
} from 'lucide-react';

export const DocumentModel = () => {
  const containerRef = useRef(null);

  // Mouse position state for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[580px] h-[520px] flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
    >
      {/* Ambient background aura */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/15 via-sky-400/10 to-transparent rounded-full blur-3xl" />

      {/* 3D Tilted Scene */}
      <motion.div 
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* === 1. 3D Realistic Paper Contract Document === */}
        <div 
          className="relative w-[340px] sm:w-[380px] h-[460px] bg-white rounded-xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25),0_10px_25px_-5px_rgba(15,23,42,0.1)] border border-slate-200/90 p-7 overflow-hidden flex flex-col justify-between"
          style={{
            transform: 'rotateZ(-5deg) translateZ(10px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Animated Scanning Laser Beam */}
          <motion.div
            className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-indigo-600 shadow-[0_0_15px_3px_rgba(56,189,248,0.65)] z-30 pointer-events-none"
            animate={{
              top: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Document Header */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="text-[11px] font-bold tracking-wider text-slate-800 uppercase">
                  LEGAL AGREEMENT
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">REF-2026-904</span>
            </div>

            <h2 className="text-center text-lg font-serif font-black tracking-wider text-slate-900 mb-4">
              CONTRACT
            </h2>

            {/* Simulated Clause Lines with Highlights */}
            <div className="space-y-2.5">
              {/* Clause 1: Normal */}
              <div className="space-y-1">
                <div className="h-1.5 bg-slate-200 rounded-full w-11/12" />
                <div className="h-1.5 bg-slate-200 rounded-full w-full" />
                <div className="h-1.5 bg-slate-200 rounded-full w-4/5" />
              </div>

              {/* Clause 2: Red Risk Highlight */}
              <div className="p-1.5 rounded-md bg-rose-50 border border-rose-200/70 space-y-1">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[9px] font-semibold text-rose-700">Section 4.2 - Indemnity Clause</span>
                </div>
                <div className="h-1.5 bg-rose-200 rounded-full w-full" />
                <div className="h-1.5 bg-rose-200 rounded-full w-9/12" />
              </div>

              {/* Clause 3: Normal */}
              <div className="space-y-1">
                <div className="h-1.5 bg-slate-200 rounded-full w-full" />
                <div className="h-1.5 bg-slate-200 rounded-full w-5/6" />
                <div className="h-1.5 bg-slate-200 rounded-full w-10/12" />
              </div>

              {/* Clause 4: Emerald Key Terms Highlight */}
              <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200/70 space-y-1">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-semibold text-emerald-700">Section 8.1 - Termination Rights</span>
                </div>
                <div className="h-1.5 bg-emerald-200 rounded-full w-11/12" />
                <div className="h-1.5 bg-emerald-200 rounded-full w-8/12" />
              </div>
            </div>
          </div>

          {/* Document Footer with Signature */}
          <div className="pt-3 border-t border-slate-200 flex items-end justify-between">
            <div className="space-y-1">
              <div className="h-1 bg-slate-200 rounded w-16" />
              <div className="h-1 bg-slate-200 rounded w-12" />
              <span className="text-[8px] text-slate-400">Date: Sep 20, 2026</span>
            </div>
            <div className="text-right">
              {/* Cursive Signature Graphic */}
              <span className="font-serif italic text-base text-indigo-700 block tracking-tight -mb-1">
                baa.
              </span>
              <div className="w-24 h-[1px] bg-slate-400" />
              <span className="text-[8px] text-slate-400">Authorized Signature</span>
            </div>
          </div>
        </div>

        {/* === 2. Floating Glass Insight Badges (Photo 4 Match) === */}

        {/* Badge 1: Top-Right "Analysis Complete" */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -right-2 sm:-right-6 w-[230px] bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.18)] border border-slate-200/90 z-20"
          style={{ transform: 'translateZ(60px)' }}
        >
          <div className="flex items-center space-x-1.5 mb-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Analysis Complete</h3>
          </div>
          <div className="space-y-1.5 text-[11px] font-medium">
            <div className="flex items-center space-x-2 text-rose-700 bg-rose-50/80 px-2 py-1 rounded-md border border-rose-100">
              <span className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold shrink-0">▲</span>
              <span>2 Potential Risks Found</span>
            </div>
            <div className="flex items-center space-x-2 text-amber-700 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-100">
              <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
              <span>3 Important Clauses</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded-md border border-emerald-100">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
              <span>12 Key Terms Identified</span>
            </div>
            <div className="flex items-center space-x-2 text-sky-700 bg-sky-50/80 px-2 py-1 rounded-md border border-sky-100">
              <span className="w-4 h-4 rounded-full bg-sky-100 flex items-center justify-center text-[10px] font-bold shrink-0">ℹ</span>
              <span>1 Missing Clause</span>
            </div>
          </div>
        </motion.div>

        {/* Badge 2: Mid-Right "Potential Risk" */}
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-[38%] -right-4 sm:-right-8 w-[240px] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.18)] border border-rose-200/90 z-20"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-4 h-4 rounded bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
              </div>
              <h4 className="text-xs font-bold text-rose-700">Potential Risk</h4>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            The contract includes a broad indemnity clause that may expose you to higher liability.
          </p>
        </motion.div>

        {/* Badge 3: Bottom-Right "Key Terms" */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-6 -right-2 sm:-right-6 w-[230px] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.18)] border border-emerald-200/90 z-20"
          style={{ transform: 'translateZ(40px)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-1.5 mb-1.5">
              <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-emerald-800">Key Terms</h4>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="space-y-0.5 text-[11px] text-slate-600">
            <div>• Termination Clause</div>
            <div>• Payment Terms</div>
            <div>• Confidentiality</div>
            <div>• Governing Law</div>
          </div>
        </motion.div>

        {/* Badge 4: Bottom-Left "Summary" */}
        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute -bottom-4 -left-4 sm:-left-8 w-[230px] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.18)] border border-indigo-200/90 z-20"
          style={{ transform: 'translateZ(45px)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center">
                <FileText className="w-2.5 h-2.5 text-indigo-600" />
              </div>
              <h4 className="text-xs font-bold text-indigo-700">Summary</h4>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Overall, the contract is mostly favorable, with a few clauses that require attention.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DocumentModel;
