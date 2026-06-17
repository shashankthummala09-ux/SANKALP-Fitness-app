/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support toggling dark mode via class
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0A0A0A",
          card: "#1A1A1A",
          primary: "#FF6B00",
          secondary: "#FF6B00",
          accent: "#FF6B00",
          text: "#F5F5F5",
          muted: "#8A8A8A",
          hover: "#CC5500",
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
      },
      backdropBlur: {
        'glass': '8px',
      }
    },
  },
  plugins: [],
}
