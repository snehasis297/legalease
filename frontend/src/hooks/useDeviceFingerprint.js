import { useState, useEffect } from 'react';

export const useDeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState('');

  useEffect(() => {
    // Generate lightweight canvas/navigator fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('LegalEase-Fingerprint', 2, 15);
      const dataUri = canvas.toDataURL();
      
      const str = `${navigator.userAgent}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}|${dataUri.slice(-30)}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      const fp = 'fp_' + Math.abs(hash).toString(16);
      window.__LEGAL_EASE_FINGERPRINT = fp;
      setFingerprint(fp);
    } catch (e) {
      const fallback = 'fp_default_' + Math.random().toString(36).substring(2, 10);
      window.__LEGAL_EASE_FINGERPRINT = fallback;
      setFingerprint(fallback);
    }
  }, []);

  return fingerprint;
};

export default useDeviceFingerprint;
