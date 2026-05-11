import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#F0D98A',
          pale: '#FBF4E3',
        },
        navy: {
          DEFAULT: '#0F1F3D',
          mid: '#1E3A5F',
          light: '#2E5B8A',
        },
        cream: {
          DEFAULT: '#FDFAF4',
          deep: '#F5EED9',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-badge': 'floatBadge 5s ease-in-out infinite',
        'float-badge-rev': 'floatBadge 5s ease-in-out infinite reverse',
        'fade-up': 'fadeUp 0.8s forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
        },
        floatBadge: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gold-radial': 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
export default config
