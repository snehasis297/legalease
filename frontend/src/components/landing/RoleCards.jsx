import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Award, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RoleCards = () => {
  const roles = [
    {
      title: 'For Clients & Founders',
      badge: 'Client Portal',
      icon: UserCheck,
      color: 'border-accent/40',
      glow: 'shadow-glow-cyan',
      description: 'Instant legal clarity without $500/hr law firm retainer bills.',
      features: [
        'Upload PDF/DOCX contracts in seconds',
        '0–100 Risk Scoring on every clause',
        'Chat with your document via AI',
        'Download redline recommendations',
      ],
      link: '/register',
      cta: 'Start Free Analysis',
    },
    {
      title: 'For Attorneys & Counsel',
      badge: 'Lawyer Portal',
      icon: Award,
      color: 'border-primary/50',
      glow: 'shadow-glow-purple',
      description: 'Accelerate contract review cycles with AI clause triage.',
      features: [
        'Verified Bar Council onboarding',
        'Pre-screened client contract queue',
        'Integrated markup & custom notes',
        'Compliance & verified status badge',
      ],
      link: '/register',
      cta: 'Join as Attorney',
    },
    {
      title: 'For Compliance & Admins',
      badge: 'Admin Command',
      icon: ShieldAlert,
      color: 'border-danger/40',
      glow: 'shadow-glow-danger',
      description: 'Total platform visibility, threat detection & governance.',
      features: [
        'Google Authenticator TOTP 2FA',
        'Live threat detection & IP blacklisting',
        'Lawyer document review & approval',
        '30-day account appeal processing',
      ],
      link: '/admin/login',
      cta: 'Admin Sign In',
    },
  ];

  return (
    <section id="roles" className="py-24 relative bg-[#090910]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-accent font-mono mb-2 font-semibold">
            Role-Based Workflows
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built for Clients, Attorneys &amp; Security Teams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((r, idx) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`glass-card p-8 rounded-2xl border ${r.color} flex flex-col justify-between relative overflow-hidden group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-accent">
                      {r.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{r.title}</h3>
                  <p className="text-sm text-textSecondary mb-6 leading-relaxed">{r.description}</p>

                  <ul className="space-y-3 mb-8">
                    {r.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center text-xs text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mr-2.5"></span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={r.link}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-sm font-semibold text-white flex items-center justify-center space-x-2 transition-all group-hover:shadow-glow-purple"
                >
                  <span>{r.cta}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
