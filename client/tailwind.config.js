/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pp: {
          forest900: '#12331f',
          forest800: '#1c4a2b',
          green700: '#2f6b3a',
          green600: '#3f7d40',
          green500: '#5a9455',
          green100: '#e7efdf',
          green50: '#f2f6ee',
          cream: '#faf9f6',
          white: '#ffffff',
          ink: '#1c211d',
          inkSoft: '#5b6259',
          line: '#e5e3da',
          gold: '#e8a33d',
        },
        dark: {
          bg: '#0b0f19',
          card: '#111827',
          border: '#1f2937',
          hover: '#374151'
        }
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif']
      },
      borderRadius: {
        'pp-sm': '8px',
        'pp-md': '14px',
        'pp-lg': '22px',
        'pp-pill': '999px',
      },
      boxShadow: {
        'pp-card': '0 4px 18px rgba(18,51,31,0.08)',
        'pp-lift': '0 12px 30px rgba(18,51,31,0.14)',
      }
    },
  },
  plugins: [],
}
