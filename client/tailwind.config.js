/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ub: {
          green: {
            logo: '#2E7A2E',
            dark: '#1E5C1E',
            medium: '#2E7D32',
            light: '#4CAF50',
            mint: '#E8F5E8',
            pale: '#F1FAF1',
          },
          blue: {
            hero: '#1B3FA0',
            card: '#162F7A',
            dark: '#0F2460',
          },
          yellow: {
            DEFAULT: '#F5C518',
            dark: '#D4A017',
          },
          white: '#FFFFFF',
          bg: {
            page: '#FFFFFF',
            surface: '#F8F9FA',
          },
          border: '#E5E7EB',
          text: {
            primary: '#1A1A1A',
            secondary: '#6B7280',
            muted: '#9CA3AF',
          }
        },
        status: {
          submitted: {
            bg: '#FEF3C7',
            text: '#92400E'
          },
          review: {
            bg: '#DBEAFE',
            text: '#1E40AF'
          },
          progress: {
            bg: '#FEE2E2',
            text: '#991B1B'
          },
          resolved: {
            bg: '#D1FAE5',
            text: '#065F46'
          }
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      }
    },
  },
  plugins: [],
}
