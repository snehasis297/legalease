import React from 'react';
import { Shield, Lock, FileCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#07070A] border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">LegalEase</span>
            </div>
            <p className="text-sm text-textSecondary leading-relaxed">
              Intelligent Contract Review &amp; Risk Assessment System. Empowering businesses and legal teams with instantaneous clause-by-clause intelligence and enterprise cryptographic protection.
            </p>
            <div className="flex items-center space-x-3 text-xs text-accent">
              <Lock className="w-4 h-4" />
              <span>AES-256-GCM Encrypted &bull; SOC-2 Ready</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-textSecondary">
              <li><a href="#features" className="hover:text-white transition-colors">AI Contract Analysis</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Threat Detection</a></li>
              <li><a href="#roles" className="hover:text-white transition-colors">Lawyer Marketplace</a></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Free Tier Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Security &amp; Legal</h4>
            <ul className="space-y-2 text-sm text-textSecondary">
              <li><Link to="/appeal" className="hover:text-white transition-colors">Account Appeal Portal</Link></li>
              <li><span className="hover:text-white cursor-pointer">Privacy &amp; Data Protection</span></li>
              <li><span className="hover:text-white cursor-pointer">Cryptographic Whitepaper</span></li>
              <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Administration</h4>
            <ul className="space-y-2 text-sm text-textSecondary">
              <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Gateway (2FA)</Link></li>
              <li><a href="mailto:security@legalease.com" className="hover:text-white transition-colors">security@legalease.com</a></li>
              <li><a href="mailto:support@legalease.com" className="hover:text-white transition-colors">support@legalease.com</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-textSecondary">
          <p>&copy; {new Date().getFullYear()} LegalEase Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for enterprise legal reliability &bull; Production Ready</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
