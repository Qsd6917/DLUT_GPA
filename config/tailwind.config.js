/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        'on-primary': 'hsl(var(--color-on-primary) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        background: 'hsl(var(--color-background) / <alpha-value>)',
        'main': 'hsl(var(--color-text-main) / <alpha-value>)',
        'muted': 'hsl(var(--color-text-muted) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
