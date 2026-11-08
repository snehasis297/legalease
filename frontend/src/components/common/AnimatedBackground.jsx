import React from 'react';

/**
 * AnimatedBackground renders the user's custom radial-gradient mesh background
 * with continuously floating and drifting translucent ambient orbs, guaranteeing
 * that smooth, high-fps animations are ALWAYS present across the entire website.
 */
export const AnimatedBackground = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Base animated radial gradient canvas */}
      <div className="absolute inset-0 site-animated-bg opacity-90 transition-opacity duration-700" />

      {/* 2. Floating Animated Radial Spheres - Feathered via pure gradient interpolation (zero GPU blur overhead) */}
      {/* Orb 1: Soft Sky / Azure at top right */}
      <div
        className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full opacity-35 dark:opacity-20 animate-float-orb-1"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(56, 189, 248, 0.12) 40%, rgba(56, 189, 248, 0) 70%)',
        }}
      />

      {/* Orb 2: Soft Indigo / Blue at center */}
      <div
        className="absolute top-[28%] left-[42%] w-[550px] h-[550px] rounded-full opacity-30 dark:opacity-18 animate-float-orb-2"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.08) 45%, rgba(99, 102, 241, 0) 70%)',
        }}
      />

      {/* Orb 3: Subtle Cyan / Sky at top left */}
      <div
        className="absolute top-[2%] left-[4%] w-[450px] h-[450px] rounded-full opacity-30 dark:opacity-15 animate-float-orb-3"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(14, 165, 233, 0.06) 40%, rgba(14, 165, 233, 0) 70%)',
        }}
      />

      {/* Orb 4: Elegant Deep Indigo at bottom left */}
      <div
        className="absolute bottom-[8%] left-[10%] w-[520px] h-[520px] rounded-full opacity-30 dark:opacity-20 animate-float-orb-4"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(79, 70, 229, 0.08) 45%, rgba(79, 70, 229, 0) 70%)',
        }}
      />

      {/* 3. Clean subtle tech grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.04)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
    </div>
  );
};

export default AnimatedBackground;
