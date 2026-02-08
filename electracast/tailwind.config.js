/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Georgia', 'sans-serif'],
        heading: ['Montserrat', 'Helvetica', 'Georgia', 'sans-serif'],
      },
      colors: {
        ec: {
          gold: '#C9C16C',
          goldDark: '#A89D4C',
          black: '#000000',
          offBlack: '#0a0a0a',
          darkGray: '#1a1a1a',
        },
      },
    },
  },
  plugins: [],
}
