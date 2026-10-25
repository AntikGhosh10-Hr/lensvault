/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vault: {
          950: "#080706",
          900: "#100f0d",
          850: "#171512",
          800: "#1f1c18",
          700: "#2d2924",
          600: "#443f38",
          400: "#8a8175",
          200: "#d6d0c7",
          100: "#ede8e1",
          50: "#faf8f5",
          accent: "#c5a059",
          accentHover: "#d9b36a",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};