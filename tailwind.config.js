/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark-disabled"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#ED7D31',
          50: '#FFF8F3',
          100: '#FEEBDD',
          200: '#FDD4B8',
          300: '#FCBC90',
          400: '#F7A364',
          500: '#ED7D31',
          600: '#D96618',
          700: '#B34E0B',
          800: '#873B08',
          900: '#5C2805',
        },
        wheat: {
          DEFAULT: '#F5DEB3',
          50: '#FDFBF7',
          100: '#FAF4E8',
          200: '#F5EEDB',
          300: '#EFE2C5',
          400: '#E8D4A8',
          500: '#F5DEB3',
          600: '#DFBE86',
          700: '#C29854',
          800: '#946F32',
          900: '#64481C',
        },
        ghost: {
          DEFAULT: '#F8F8FF',
          50: '#FFFFFF',
          100: '#FAF8FC',
          200: '#F4F2FA',
        },
        charcoal: {
          DEFAULT: '#2B2B2B',
          soft: '#333333',
          muted: '#7A7568',
        },
        borderLight: '#E8DFC8',
        successSoft: '#4CAF50',
        alertSoft: '#E76F51',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(122, 117, 104, 0.08), 0 2px 6px -1px rgba(122, 117, 104, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(122, 117, 104, 0.12), 0 4px 10px -2px rgba(122, 117, 104, 0.06)',
        'gold-glow': '0 0 25px rgba(237, 125, 49, 0.35)',
        'gold-sm': '0 2px 10px rgba(237, 125, 49, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.4s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
