/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#FF9F00', dark: '#e68e00' },
        amazon: { blue: '#131921', teal: '#00A8CC' }
      }
    }
  },
  plugins: []
};
