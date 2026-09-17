import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import LiveDemo from '../components/landing/LiveDemo';
import SecuritySection from '../components/landing/SecuritySection';
import RoleCards from '../components/landing/RoleCards';
import StatsSection from '../components/landing/StatsSection';
import CtaSection from '../components/landing/CtaSection';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col justify-between">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <LiveDemo />
        <SecuritySection />
        <RoleCards />
        <StatsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
