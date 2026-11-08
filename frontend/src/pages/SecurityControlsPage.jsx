import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import EnterpriseSecurityControls from '../components/common/EnterpriseSecurityControls';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const SecurityControlsPage = () => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-textSecondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <EnterpriseSecurityControls />
      </main>

      <Footer />
    </div>
  );
};

export default SecurityControlsPage;
