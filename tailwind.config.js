/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          temple: {
            red: '#8b0000',
            gold: '#d4af37',
          }
        },
        animation: {
          'spin-slow': 'spin 10s linear infinite',
        }
      },
    },
    plugins: [],
  }