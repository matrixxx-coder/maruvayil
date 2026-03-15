/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#24678d',
          50: '#f0f7fb',
          100: '#daeef7',
          200: '#b5dcef',
          300: '#82c3e1',
          400: '#4aa3cd',
          500: '#2887b8',
          600: '#24678d',
          700: '#1f5476',
          800: '#1d4663',
          900: '#1c3b53',
        },
        maroon: {
          DEFAULT: '#8d2424',
          50: '#fdf3f3',
          100: '#fbe5e5',
          200: '#f8cfcf',
          300: '#f2abab',
          400: '#e87878',
          500: '#d94a4a',
          600: '#c43030',
          700: '#8d2424',
          800: '#7a2020',
          900: '#661f1f',
        },
        gold: {
          DEFAULT: '#c9a227',
          50: '#fdf9ec',
          100: '#faf0ca',
          200: '#f4e090',
          300: '#eecb54',
          400: '#e8b82e',
          500: '#c9a227',
          600: '#a37d1a',
          700: '#7e5f18',
          800: '#684d1a',
          900: '#594119',
        },
        cream: '#fdf8f2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        malayalam: ['"Noto Sans Malayalam"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
