import React, { useRef, useState } from 'react';

export const OtpInput = ({ length = 6, value = '', onChange }) => {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      // Clear current digit
      const chars = value.split('');
      chars[index] = '';
      onChange(chars.join(''));
      return;
    }

    const lastChar = val[val.length - 1];
    const chars = value.padEnd(length, ' ').split('');
    chars[index] = lastChar;
    const nextVal = chars.join('').trimEnd();
    onChange(nextVal);

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    onChange(pasteData);
    const targetIdx = Math.min(pasteData.length, length - 1);
    inputsRef.current[targetIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-between gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-12 h-14 text-center text-2xl font-bold font-mono rounded-xl bg-[#121220] border border-white/20 text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/40 transition-all shadow-inner"
        />
      ))}
    </div>
  );
};

export default OtpInput;
