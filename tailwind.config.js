/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:       '#0F6E56',
        'primary-dk':  '#085041',
        'primary-lt':  '#E1F5EE',
        gold:          '#EF9F27',
        'gold-lt':     '#FFF8ED',
        surface:       '#F4FAF8',
        danger:        '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(15,110,86,0.08)',
        'card-md': '0 4px 24px rgba(15,110,86,0.13)',
      },
    },
  },
  plugins: [],
}
