/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        card: '#1A1A2E',
        'card-dark': '#0F0F1A',
        primary: '#534AB7',
        'primary-light': '#6B61D1',
        accent: '#00D4FF',
        success: '#00FF88',
        danger: '#FF3355',
        warning: '#FFAA00',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0B0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px rgba(83, 74, 183, 0.45)',
        'glow-cyan': '0 0 25px rgba(0, 212, 255, 0.45)',
        'glow-danger': '0 0 25px rgba(255, 51, 85, 0.45)',
      },
    },
  },
  plugins: [],
}
