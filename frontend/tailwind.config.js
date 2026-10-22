/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#142b35',
        muted: '#70838a',
        teal: { 50: '#eaf8f5', 100: '#d3f0e9', 500: '#1aa88e', 600: '#128c77', 700: '#0f7162' },
        canvas: '#f4f7f8',
      },
      boxShadow: { soft: '0 8px 28px rgba(19, 54, 61, .06)' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
