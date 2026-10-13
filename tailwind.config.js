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
        sepia: {
          50: '#ffffff',   // Crisp, pure white card surface
          100: '#f7ede0',  // Soft warm tint
          150: '#ede0cc',  // Clearly recessed warm writing box
          200: '#decbb3',  // Rich warm tan parchment page background
          300: '#b89b7b',  // Strong, visible card & input border
          400: '#9f805f',  // Active/focused borders
          700: '#6d3e14',  // Warm leather brown buttons & active tabs
          800: '#4a2707',  // Deep rich heading accent
          900: '#261303',  // Dark espresso body text
          950: '#140801',  // Maximum contrast dark ink text
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
