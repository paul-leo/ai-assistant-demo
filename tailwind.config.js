/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'typing': 'typing 1.4s infinite ease-in-out',
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': {
            transform: 'translateY(0)',
            opacity: '0.5',
          },
          '30%': {
            transform: 'translateY(-10px)',
            opacity: '1',
          },
        },
      },
      animationDelay: {
        '200': '0.2s',
        '400': '0.4s',
      },
    },
  },
  plugins: [],
}
