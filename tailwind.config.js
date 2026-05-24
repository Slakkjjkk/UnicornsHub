/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        13: '3.25rem',
      },
    },
  },
  plugins: [],
};
