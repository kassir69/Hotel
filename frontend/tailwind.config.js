/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    "bg-green-100", "bg-red-100", "bg-blue-100", "bg-yellow-100",
    "text-green-700", "text-red-700", "text-blue-700", "text-yellow-700",
    "border-green-400", "border-red-400", "border-blue-400",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#70210D",
        secondary: "#82731B",
      },
      fontFamily: {
        sans: ["'Nunito'", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
      },
    },
  },
  plugins: [],
};
