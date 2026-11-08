import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  FileCheck2, 
  Database, 
  Lock, 
  CheckCircle2, 
  ArrowUpRight, 
  Cpu, 
  Eye, 
  Layers, 
  Sparkles 
} from 'lucide-react';

export const EnterpriseSecurityControls = () => {
  const [activeTab, setActiveTab] = useState('ALL');

  const controls = [
    {
      id: 'SESSION',
      area: 'Session & Authentication Controls',
      icon: KeyRound,
      badge: 'Core Auth & Session',
      color: 'from-blue-500 to-indigo-600',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      controlImplemented: [
        'Stateless JWT session lifecycle (2-hour TTL) with sliding inactivity auto-invalidation',
        'Passwordless cryptographic 6-digit one-time code (OTP) authentication flow',
        'BCrypt cost-factor 12 salted key derivation for credential-backed accounts',
        'Spring Security hardened headers (CSP: default-src \'self\', X-Frame-Options: DENY, HSTS max-age=31536000, X-Content-Type-Options: nosniff)',
        'In-memory token lifecycle isolation preventing localStorage credential scraping'
      ],
      impact: 'Completely eliminates credential-stuffing and brute-force vector surfaces; mitigates token-replay, clickjacking, and XSS attacks; guarantees zero plaintext credential storage.'
    },
    {
      id: 'PRIVACY',
      area: 'Client & Case Confidentiality (Access Control)',
      icon: Lock,
      badge: 'Access & Privilege',
      color: 'from-purple-500 to-pink-600',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      controlImplemented: [
        'Client-contract ownership validation enforced on every REST endpoint (HTTP 403 Forbidden on foreign tenant probes)',
        'Bar Council credential validation & automated biometric verification before lawyer queue assignment',
        'Strict DTO parameter whitelisting to eliminate mass-assignment vulnerabilities',
        'JWT-authenticated WebSocket channels ensuring private end-to-end client-attorney communication',
        'Role-scoped query filters (CLIENT, LAWYER, ADMIN) ensuring horizontal isolation'
      ],
      impact: 'Guarantees strict legal privilege and client confidentiality; eliminates Broken Object Level Authorization (BOLA/IDOR); prevents unauthorized data leakage between opposing legal parties.'
    },
    {
      id: 'INGESTION',
      area: 'Secure Legal Document & Evidence Ingestion',
      icon: FileCheck2,
      badge: 'Document Ingestion',
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      controlImplemented: [
        'Multi-tier file boundary enforcement with strict 10MB bounds',
        'Magic-byte binary header inspection for PDF, DOCX, PNG, and JPEG files (stopping disguised executable payloads)',
        'Corrupt or empty payload instant HTTP 400 rejection with structured audit logging',
        'Deterministic legal clause extraction bounds preventing LLM hallucination in contract summarization',
        'Isolated file processing pipeline with sanitized temporary buffer release'
      ],
      impact: 'Protects legal repository from malicious binary injections, polyglot exploits, and buffer-overflow vectors; ensures courtroom-admissible, pristine document ingestion integrity.'
    },
    {
      id: 'DATA_QUALITY',
      area: 'Data Quality, Integrity & Anti-Tamper Engine',
      icon: Database,
      badge: 'Integrity & Quality',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      controlImplemented: [
        'Cryptographic SHA-256 tamper-evident digital fingerprinting computed and stored for every uploaded legal brief and contract',
        'Stale request rejection with strict 5-minute OTP and authorization token TTL',
        'Rapid-submission idempotency debounce (< 3s sliding window) preventing duplicate case filings and race conditions',
        'Immutable event logging recording IP address, user agent, timestamp, and status on all critical operations',
        'Cryptographic checksum validation on file download and verification'
      ],
      impact: 'Provides non-repudiation and cryptographic proof of evidence integrity for judicial standards; eliminates database duplication or state race conditions during concurrent legal filings.'
    }
  ];

  const filteredControls = activeTab === 'ALL' ? controls : controls.filter(c => c.id === activeTab);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ENTERPRISE GOVERNANCE & ARCHITECTURAL CONTROLS</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Production Security & Data Integrity Controls
          </h2>
          <p className="text-textSecondary text-xs mt-1">
            Optimized, reliable, and flexible defensive controls implemented across LegalEase.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'SESSION', 'PRIVACY', 'INGESTION', 'DATA_QUALITY'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-glow-purple'
                  : 'bg-card/50 text-textSecondary hover:text-white border border-white/10'
              }`}
            >
              {tab === 'ALL' ? 'All Controls' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Control Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredControls.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="card border border-white/10 hover:border-accent/30 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{item.area}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border mt-0.5 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controlled Implemented List */}
                <div className="space-y-2 mt-4">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-accent">
                    Controls Implemented:
                  </div>
                  <ul className="space-y-2">
                    {item.controlImplemented.map((ctrl, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{ctrl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Impact / Optimization Banner */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                  <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-1">
                    Enterprise Impact & Optimization:
                  </span>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    {item.impact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnterpriseSecurityControls;
