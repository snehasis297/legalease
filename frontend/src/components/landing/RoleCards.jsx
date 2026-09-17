import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Award, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export const RoleCards = () => {
  const { activeSection, setActiveSection } = useTheme();
  const isActive = activeSection === 'roles';

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
      color: 'border-amber-500/50',
      glow: 'shadow-amber-500/20',
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
    <section 
      id="roles" 
      onClick={() => setActiveSection('roles')}
      className={`py-24 relative transition-all duration-500 cursor-pointer ${
        isActive 
          ? 'bg-gradient-to-b from-amber-950/40 via-[#090910] to-[#090910] ring-2 ring-amber-500/40 shadow-[0_0_80px_rgba(245,158,11,0.18)]' 
          : 'bg-[#090910]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {isActive ? (
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono mb-3 shadow-lg shadow-amber-500/20 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ACTIVE INSPECTION: MULTI-PERSONA GOVERNANCE</span>
            </div>
          ) : (
            <h2 className="text-xs uppercase tracking-widest text-amber-400 font-mono mb-2 font-semibold">
              Tailored Experiences
            </h2>
          )}
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Built for Every Stakeholder
          </p>
          <p className="text-textSecondary text-base mt-3">
            Choose your workflow: consumer contract review, certified bar practice, or platform defense.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`glass-card p-8 flex flex-col justify-between border transition-all duration-300 group hover:border-amber-500/50 ${
                  isActive ? 'border-amber-500/40 shadow-lg shadow-amber-500/10' : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-medium">
                      {role.badge}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-textSecondary text-sm mb-6 leading-relaxed">
                    {role.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {role.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start text-xs text-textSecondary space-x-2">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={role.link}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/50 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all group-hover:shadow-md"
                >
                  <span>{role.cta}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
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
