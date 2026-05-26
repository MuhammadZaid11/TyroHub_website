/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js"
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            50: '#f4f5f9',
            100: '#e8eaf2',
            200: '#c5cbde',
            300: '#97a3c3',
            400: '#6474a4',
            500: '#47588b',
            600: '#374470',
            700: '#2b3558',
            800: '#1b213b',
            900: '#0d1226', // Deep Card Navy
            950: '#0a0e1a', // Darkest Background Navy
          },
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6', // Primary Electric Blue
            600: '#2563eb',
            700: '#1d4ed8',
            850: '#1e3a8a',
            900: '#1e3a8a',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px rgba(59, 130, 246, 0.45)',
        'glow-blue-lg': '0 0 50px rgba(59, 130, 246, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
