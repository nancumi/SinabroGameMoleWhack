/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xxs': ['11px', '14px'],
        'base-rule': ['12px', '16px'],
      },
      keyframes: {
        'pop-up': {
          '0%': { transform: 'translateY(100%) scale(0.7)', opacity: '0.3' },
          '60%': { transform: 'translateY(-10%) scale(1.05)', opacity: '1' },
          '100%': { transform: 'translateY(0%) scale(1)', opacity: '1' },
        },
        'hit-shake': {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(0.85) rotate(-10deg)' },
          '50%': { transform: 'scale(0.9) rotate(8deg)' },
          '75%': { transform: 'scale(0.7) rotate(-4deg)' },
          '100%': { transform: 'scale(0) translateY(40%)' },
        },
        'float-score': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-30px) scale(1.2)' },
        }
      },
      animation: {
        'pop-up': 'pop-up 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'hit-shake': 'hit-shake 0.3s ease-out forwards',
        'float-score': 'float-score 0.6s ease-out forwards',
      }
    },
  },
  plugins: [],
}

