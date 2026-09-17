import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Shield, Sparkles, MessageCircle } from 'lucide-react';

export const LiveDemo = () => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.02);
    setRotateY(x * 0.02);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Platform Simulation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Clause Breakdown &amp; Real-Time Risk Diagnostics
          </h2>
          <p className="text-textSecondary text-base mt-3">
            Watch how our intelligent risk engine surfaces critical liability clauses.
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
          <div className="glass-card rounded-2xl border border-white/15 overflow-hidden shadow-2xl shadow-primary/20">
            {/* Browser chrome header */}
            <div className="bg-[#121220] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-danger inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-warning inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-success inline-block"></span>
              </div>
              <div className="bg-background/80 px-6 py-1 rounded-lg text-xs font-mono text-textSecondary border border-white/5 flex items-center space-x-2">
                <Shield className="w-3 h-3 text-accent" />
                <span>legalease.app/analysis/doc-9842</span>
              </div>
              <div className="w-12"></div>
            </div>

            {/* Mockup Dashboard Content */}
            <div className="p-6 sm:p-8 bg-[#0D0D16] space-y-6">
              {/* Top Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">SaaS Master Services Agreement (Vendor_Redline).pdf</h3>
                  <p className="text-xs text-textSecondary mt-1">Uploaded 2 minutes ago &bull; 14 Clauses Parsed &bull; AES-256-GCM Verified</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2 rounded-xl bg-danger/20 border border-danger/40 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger animate-ping"></span>
                    <span className="text-sm font-bold text-danger">Score: 82/100 (HIGH RISK)</span>
                  </div>
                </div>
              </div>

              {/* Sample Clauses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HIGH Risk Card with pulsing red glow */}
                <div className="p-5 rounded-xl bg-card border high-risk-glow space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-danger font-bold uppercase tracking-wider">
                      Clause 8.1 &bull; Indemnification
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-danger text-white">
                      HIGH RISK
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 italic bg-black/30 p-3 rounded-lg border border-white/5">
                    "Client agrees to unconditionally indemnify, defend and hold harmless the Company from any loss, damage, legal fees, and consequential losses whatsoever."
                  </p>
                  <p className="text-xs text-textSecondary">
                    <strong className="text-white">Risk:</strong> Disproportionate unilateral indemnification without reciprocal obligations or dollar caps.
                  </p>
                  <div className="p-2.5 rounded-lg bg-primary/20 border border-primary/40 text-xs text-accent">
                    <strong>Suggestion:</strong> Insert reciprocal indemnity and cap total aggregate liabilities strictly to the prior 12 months' paid fees.
                  </div>
                </div>

                {/* Medium Risk Card */}
                <div className="p-5 rounded-xl bg-card border border-warning/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-warning font-bold uppercase tracking-wider">
                      Clause 11.4 &bull; Non-Solicitation
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-warning/20 text-warning border border-warning/40">
                      MEDIUM RISK
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 italic bg-black/30 p-3 rounded-lg border border-white/5">
                    "For a period of 24 months post termination, Customer shall not directly or indirectly hire or solicit any employee or contractor."
                  </p>
                  <p className="text-xs text-textSecondary">
                    <strong className="text-white">Risk:</strong> 24-month duration is unusually punitive for commercial service engagements.
                  </p>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                    <strong>Suggestion:</strong> Negotiate duration down to 6-12 months with standard exception for general public job postings.
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
