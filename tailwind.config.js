/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        slate: {
          850: '#151f32',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        'card-hover': '0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.03)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.06), 0 1px 2px 0 rgba(255, 255, 255, 0.6) inset',
        'glass-hover': '0 12px 36px 0 rgba(31, 38, 135, 0.1), 0 1px 2px 0 rgba(255, 255, 255, 0.8) inset',
        'glow': '0 0 20px -3px rgba(99, 102, 241, 0.3)',
        'modal': '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
