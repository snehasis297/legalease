import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield } from 'lucide-react';

const mockLogs = [
  '[SECURITY_INITIALIZED] Threat detection daemon active on all network endpoints',
  '[BLOCKED] IP 192.168.1.45 — Brute force login attempt (5 failed/10min)',
  '[FLAGGED] fake_user_99 — Duplicate PAN ID detected via SHA-256 hash match',
  '[ACTION] Account suspended immediately & Admin alert dispatched',
  '[BLOCKED] IP 10.0.0.12 — Bot detected: 14 req/sec sliding window exceeded',
  '[PERMANENT_BLACKLIST] IP 10.0.0.12 written to Redis and ip_blacklist table',
  '[BLOCKED] payload.exe.pdf — Malicious file: MIME type != magic byte header',
  '[FORCED_LOGOUT] User #418 token revoked: Device fingerprint mismatch',
  '[ENCRYPTION] AES-256-GCM cipher generated with unique 96-bit IV',
  '[RATE_LIMIT] Client IP 45.33.32.156 reached 100 req/min limit',
  '[AUDIT_LOG] Admin authenticated via Google Authenticator TOTP token',
];

export const HackerTerminal = () => {
  const [logs, setLogs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (currentIndex < mockLogs.length) {
      const timeout = setTimeout(() => {
        setLogs((prev) => [...prev, mockLogs[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, 900);
      return () => clearTimeout(timeout);
    } else {
      // Loop logs
      const reset = setTimeout(() => {
        setLogs([]);
        setCurrentIndex(0);
      }, 5000);
      return () => clearTimeout(reset);
    }
  }, [currentIndex]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#00FF88]/30 shadow-2xl bg-[#08080C] mt-12 font-mono text-xs sm:text-sm">
      {/* Terminal Top Bar */}
      <div className="bg-[#12121A] px-4 py-2.5 border-b border-[#00FF88]/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#00FF88]" />
          <span className="text-[#00FF88] font-bold text-xs tracking-wider">
            LEGALEASE_THREAT_DETECTION_STREAM // ACTIVE
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-textSecondary">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping"></span>
          <span>LIVE IDS FEED</span>
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="p-5 h-64 overflow-y-auto space-y-2 text-[#00FF88] scrollbar-thin">
        {logs.map((line, idx) => {
          const isBlocked = line.includes('[BLOCKED]') || line.includes('[PERMANENT_BLACKLIST]');
          const isFlagged = line.includes('[FLAGGED]') || line.includes('[FORCED_LOGOUT]');
          return (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-gray-500 select-none">&gt;</span>
              <span className={isBlocked ? 'text-[#FF3355] font-semibold' : isFlagged ? 'text-[#FFAA00]' : 'text-[#00FF88]'}>
                {line}
              </span>
            </div>
          );
        })}
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">&gt;</span>
          <span className="inline-block w-2.5 h-4 bg-[#00FF88] cursor-blink"></span>
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default HackerTerminal;
