import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Shield, Play, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DocumentModel from '../../three/DocumentModel';
import ParticleField from '../../three/ParticleField';
import VideoModal from './VideoModal';

export const HeroSection = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* 3D Particle Cloud Background */}
      <ParticleField />

      {/* Radial Glow & Subtle Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(83,74,183,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Top Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 shadow-glow-purple">
              <Zap className="w-4 h-4 text-accent animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-white">
                ⚡ AI-Powered Legal Protection
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Intelligent Contract Review &amp;{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-white to-primary-light">
                Risk Assessment
              </span>
            </h1>

            {/* Typewriter Effect */}
            <div className="h-10 flex items-center text-lg sm:text-xl font-mono text-accent">
              <TypeAnimation
                sequence={[
                  'Analyzing employment contracts...',
                  2000,
                  'Flagging non-compete overreach...',
                  2000,
                  'Analyzing rental agreements...',
                  2000,
                  'Detecting uncapped indemnity traps...',
                  2000,
                  'Analyzing enterprise NDAs & SaaS MSAs...',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>

            <p className="text-base sm:text-lg text-textSecondary max-w-xl leading-relaxed">
              Upload PDF or DOCX agreements to decrypt, parse, and review every clause in seconds.
              Identify hidden hazards, calculate instant risk scores, and interrogate your documents
              with our conversational legal chatbot.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold text-base shadow-glow-purple hover:scale-105 transition-all"
              >
                <span>Analyze Free</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <button
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center px-5 py-3.5 rounded-xl glass border border-white/10 hover:border-accent text-white font-semibold text-base hover:bg-white/5 transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mr-2.5 group-hover:scale-110 transition-transform">
                  <Play className="w-3.5 h-3.5 text-accent fill-accent" />
                </div>
                <span>Watch How It Works</span>
              </button>
            </div>

            {/* Metric Highlights */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-6 text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">10,000+</p>
                <p className="text-xs sm:text-sm text-textSecondary">Documents Reviewed</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-accent">50,000+</p>
                <p className="text-xs sm:text-sm text-textSecondary">Clauses Evaluated</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-success">99.9%</p>
                <p className="text-xs sm:text-sm text-textSecondary">Precision Score</p>
              </div>
            </div>
          </motion.div>

          {/* Right 3D Shield Model */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative z-10 w-full flex items-center justify-center">
              <DocumentModel />
            </div>
            {/* Subtle glow circle behind 3D model */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/20 blur-3xl -z-0 pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />
    </section>
  );
};

export default HeroSection;
