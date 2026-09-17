import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck } from 'lucide-react';

const messages = [
  'Decrypting AES-256-GCM ciphertext...',
  'Extracting structural paragraphs & headers...',
  'Splitting into clauses & numbered sections...',
  'Running Legal AI Risk Assessment Model...',
  'Evaluating indemnity & uncapped liability thresholds...',
  'Flagging restrictive covenants & non-competes...',
  'Generating executive summary & redline advice...',
  'Finalizing risk score calculation...',
];

export const AnalyzingOverlay = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 98;
        }
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 450);

    const messageInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-lg w-full p-8 rounded-2xl border border-primary/50 text-center space-y-6 shadow-glow-purple"
      >
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-accent animate-spin" />
          <Cpu className="w-9 h-9 text-accent animate-pulse" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Analyzing Contract
          </h3>
          <p className="text-sm font-mono text-accent h-6 mt-2">
            {messages[msgIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-textSecondary">
            <span>Overall Progress</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-primary via-accent to-success h-2.5 rounded-full transition-all duration-300 shadow-glow-cyan"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-textSecondary pt-2">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>Zero Knowledge Processing &bull; Ephemeral Analysis</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyzingOverlay;
