import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Shield, Sparkles, MessageCircle, Bot } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const LiveDemo = () => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const { activeSection, setActiveSection } = useTheme();

  const isActive = activeSection === 'live-demo';
  const animFrameRef = React.useRef(null);

  const handleMouseMove = (e) => {
    if (animFrameRef.current) return;
    const currentTarget = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;

    animFrameRef.current = requestAnimationFrame(() => {
      const rect = currentTarget.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;
      setRotateX(-y * 0.015);
      setRotateY(x * 0.015);
      animFrameRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section 
      id="live-demo" 
      onClick={() => setActiveSection('live-demo')}
      className={`py-24 scroll-mt-24 relative overflow-hidden transition-all duration-300 ${
        isActive 
          ? 'bg-emerald-500/10 backdrop-blur-md ring-2 ring-emerald-500/40 shadow-[0_0_80px_rgba(16,185,129,0.15)]' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {isActive ? (
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono mb-3 shadow-lg shadow-emerald-500/20 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ACTIVE INSPECTION: NEURAL CLAUSE REDLINING</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
              <Bot className="w-3.5 h-3.5" />
              <span>Interactive Platform Simulation</span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Clause Breakdown &amp; Real-Time Risk Diagnostics
          </h2>
          <p className="text-textSecondary text-base mt-3">
            Watch how our intelligent risk engine surfaces critical liability clauses. Click to inspect live analysis.
          </p>
        </div>

        {/* Browser Mockup with 3D Mouse Tilt */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="max-w-5xl mx-auto transition-transform duration-200 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          <div className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
            isActive ? 'border-emerald-500/50 shadow-emerald-500/20' : 'border-white/15 shadow-primary/20'
          }`}>
            {/* Browser chrome header */}
            <div className="bg-[#121220] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-danger inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-warning inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-success inline-block"></span>
              </div>
              <div className="bg-background/80 px-6 py-1 rounded-lg text-xs font-mono text-textSecondary border border-white/5 flex items-center space-x-2">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>legalease.app/analysis/doc-9842</span>
              </div>
              <div className="w-12"></div>
            </div>

            {/* Analysis Workspace Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header inside mockup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400">NON-DISCLOSURE AGREEMENT (NDA)</span>
                  <h3 className="text-xl font-bold text-white mt-1">Acme Global Master Collaboration Agreement</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs text-textSecondary block">Risk Index</span>
                    <span className="text-2xl font-black text-danger font-mono">78 / 100</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-danger/20 border-t-danger flex items-center justify-center font-mono text-xs font-bold text-danger animate-spin-slow">
                    HIGH
                  </div>
                </div>
              </div>

              {/* Sample Clause Cards with Highlighting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Clause 1: High Risk */}
                <div className="p-4 rounded-xl border border-danger/40 bg-danger/5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-danger font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Clause 4.2 — Uncapped Indemnity</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-danger/20 text-danger border border-danger/30 font-bold">
                      CRITICAL RISK
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary font-mono italic leading-relaxed">
                    "Receiving Party shall defend and hold harmless Disclosing Party against ALL claims, losses, or liabilities without monetary limitation..."
                  </p>
                  <div className="pt-2 border-t border-danger/20 text-xs text-white">
                    <strong className="text-danger">AI Redline: </strong>
                    Cap indemnity obligations at 1x total aggregate contract fees paid.
                  </div>
                </div>

                {/* Clause 2: Standard Risk */}
                <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-bold flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Clause 8.1 — Confidentiality Duration</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      STANDARD
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary font-mono italic leading-relaxed">
                    "Confidentiality obligations under this Agreement shall expire three (3) years from the effective termination date."
                  </p>
                  <div className="pt-2 border-t border-emerald-500/20 text-xs text-white">
                    <strong className="text-emerald-400">AI Assessment: </strong>
                    Term aligns with customary commercial market standard.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDemo;
