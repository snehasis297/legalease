import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';

export const VideoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-4xl glass-card border border-primary/40 rounded-2xl overflow-hidden shadow-glow-purple z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-card">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span className="font-semibold text-white text-sm sm:text-base">
                LegalEase Platform Walkthrough: End-to-End Contract Intelligence
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Container / Interactive Demonstration Screen */}
          <div className="relative aspect-video bg-black/90 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
            {/* Animated Demo Interface Mockup */}
            <div className="w-full h-full rounded-xl border border-white/10 bg-[#0F0F1A] p-6 flex flex-col justify-between shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-danger"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-xs text-textSecondary ml-3 font-mono">
                    Analysis Engine: Enterprise_Master_Services_Agreement.pdf
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-danger/20 text-danger border border-danger/40 font-mono">
                  RISK: HIGH (78/100)
                </span>
              </div>

              <div className="space-y-4 my-auto text-left max-w-xl mx-auto">
                <div className="p-4 rounded-lg bg-card border border-danger/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-danger uppercase tracking-wider">
                      Clause 14.2 &bull; Indemnification Overreach
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-danger text-white font-bold">
                      HIGH RISK
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 italic">
                    "Client agrees to defend, indemnify, and hold harmless Contractor against all claims, liabilities, and legal costs whatsoever..."
                  </p>
                  <p className="text-xs text-accent mt-2 font-medium">
                    &#9889; AI Recommendation: Strike unilateral liability. Insert reciprocal indemnity with 12-month fee cap.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10 text-xs text-textSecondary">
                <span>AES-256-GCM Secure Encryption</span>
                <span className="text-success font-mono">Analysis Time: 1,420 ms &bull; Complete</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoModal;
