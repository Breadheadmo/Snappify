/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shimmerBlack: {
          50: '#f0f0f0',    /* Very light gray for subtle contrast */
          100: '#e0e0e0',   /* Lighter gray */
          200: '#c0c0c0',   /* Light gray */
          300: '#a0a0a0',   /* Medium light gray */
          400: '#808080',   /* Medium gray */
          500: '#606060',   /* Darker gray */
          600: '#404040',   /* Dark gray */
          700: '#202020',   /* Very dark gray */
          800: '#1a1a1a',   /* Near black */
          900: '#0a0a0a',   /* Almost black */
          950: '#000000',   /* Pure black */
        },
        primary: {
          50: '#f0f0f0',
          100: '#e0e0e0',
          200: '#c0c0c0',
          300: '#a0a0a0',
          400: '#808080',
          500: '#606060',
          600: '#404040',
          700: '#202020',
          800: '#1a1a1a',
          900: '#0a0a0a',
        },
        secondary: {
          50: '#ffffff', /* White for secondary background elements */
          100: '#f8f8f8',
          200: '#f0f0f0',
          300: '#e8e8e8',
          400: '#e0e0e0',
          500: '#d8d8d8',
          600: '#d0d0d0',
          700: '#c8c8c8',
          800: '#c0c0c0',
          900: '#b8b8b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
