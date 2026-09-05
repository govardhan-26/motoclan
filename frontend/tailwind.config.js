/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#F97316',
          hover:   '#EA6C0C',
          light:   '#FED7AA',
        },
        dark: {
          bg:      '#0A0A0A',
          surface: '#141414',
          card:    '#1C1C1C',
          border:  '#2A2A2A',
          hover:   '#242424',
        },
        light: {
          bg:      '#F8F8F8',
          surface: '#FFFFFF',
          card:    '#FFFFFF',
          border:  '#E4E4E7',
          hover:   '#F0F0F0',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
