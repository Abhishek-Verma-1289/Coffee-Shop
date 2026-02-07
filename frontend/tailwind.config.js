/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coffee-dark': '#2C1810',
        'coffee-brown': '#6F4E37',
        'coffee-light': '#C9A88A',
      }
    },
  },
  plugins: [],
}
