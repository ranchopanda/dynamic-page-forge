/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#c4a574",
        "primary-dark": "#a08050",
        "background-light": "#f5f0eb",
        "background-dark": "#1f1a15",
        "text-primary-light": "#2B1810",
        "text-primary-dark": "#FFF8F2",
        "accent-gold": "#c4a574",
        "footer-bg": "#ebe5dc",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        headline: ["Playfair Display", "serif"],
        "sub-headline": ["Cormorant Garamond", "serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
      },
      spacing: {
        // Consistent spacing scale
        'section': '4rem', // 64px - py-16
        'section-lg': '6rem', // 96px - py-24
        'container': '2rem', // 32px - px-8
      },
      boxShadow: {
        "primary-soft": "0 4px 14px 0 rgba(196, 165, 116, 0.25)",
        "primary-soft-hover": "0 6px 20px 0 rgba(196, 165, 116, 0.35)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
