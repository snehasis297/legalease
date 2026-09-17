import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Key, AlertOctagon, Smartphone, Server } from 'lucide-react';
import HackerTerminal from './HackerTerminal';

export const SecuritySection = () => {
  const cards = [
    {
      title: 'AES-256-GCM File Cryptography',
      desc: 'Unique 96-bit initialization vectors per contract upload. Plaintext is never written to disk unencrypted.',
      icon: Lock,
    },
    {
      title: 'Real-Time Threat Detection',
      desc: 'Automatic detection of brute force, multi-account abuse, malicious binary headers, and bot scraping.',
      icon: AlertOctagon,
    },
    {
      title: 'Zero-Knowledge ID Verification',
      desc: 'Government ID numbers are AES-256 encrypted in DB, while SHA-256 one-way hashing stops duplicate account abuse.',
      icon: ShieldCheck,
    },
    {
      title: 'Admin TOTP Two-Factor Auth',
      desc: 'Hardware/software Google Authenticator TOTP required for all elevated administrative operations.',
      icon: Key,
    },
    {
      title: 'In-Memory JWT & Instant Revocation',
      desc: 'Tokens reside exclusively in React volatile memory, never in insecure localStorage. Immediate Redis forced logout on flags.',
      icon: Smartphone,
    },
    {
      title: 'Redis Sliding-Window Rate Limiting',
      desc: 'Granular threshold enforcement on logins, OTP requests, registrations, and uploads to eliminate denial-of-service.',
      icon: Server,
    },
  ];

  return (
    <section id="security" className="py-24 relative bg-[#07070B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-danger/10 border border-danger/30 text-danger text-xs font-mono mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Military-Grade Cybersecurity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Defense-in-Depth Architecture
          </h2>
          <p className="text-textSecondary text-base mt-3">
            LegalTech requires unmatched confidentiality. We treat every contract with nation-state cryptographic protection.
          </p>
        </div>

        {/* 6 Glassmorphism Security Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -6, boxShadow: '0 0 25px rgba(0, 212, 255, 0.25)' }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
                  {c.title}
                </h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  {c.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Hacker Terminal Below */}
        <HackerTerminal />
      </div>
    </section>
  );
};

export default SecuritySection;
