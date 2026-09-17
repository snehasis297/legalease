import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const useScrollAnimation = (animationConfig) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;
    gsap.fromTo(
      elementRef.current,
      { opacity: 0, y: 30, ...animationConfig?.from },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        ...animationConfig?.to,
      }
    );
  }, []);

  return elementRef;
};

export default useScrollAnimation;
