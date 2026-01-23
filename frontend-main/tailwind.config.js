/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        atlas: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4b8fc',
          400: '#7e91f8',
          500: '#5e6bf1',
          600: '#4a4de5',
          700: '#3d3dca',
          800: '#3434a3',
          900: '#303181',
          950: '#1e1d4c',
        },
        night: {
          50: '#f6f6f9',
          100: '#ececf2',
          200: '#d5d6e2',
          300: '#b1b3c8',
          400: '#878aa9',
          500: '#686b8e',
          600: '#535576',
          700: '#444560',
          800: '#3b3c51',
          900: '#343446',
          950: '#0d0d12',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
