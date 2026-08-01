/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          900: '#881337',
        },
        cinema: {
          gold: '#f59e0b',
          purple: '#8b5cf6',
          darkBg: '#0b0f19',
          cardBg: '#131b2e',
          accent: '#e11d48',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(225, 29, 72, 0.5)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 5px rgba(225, 29, 72, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}
