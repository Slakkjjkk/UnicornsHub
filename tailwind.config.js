/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#09090b',
        panel: '#18181b',
        line: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
};
