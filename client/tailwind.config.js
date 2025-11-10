/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./index.html", "./public/index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF6EF", // page bg
          100: "#F8EEE3", // sidebar bg
          200: "#FADFCB",
          300: "#F6C79E",
          400: "#F2AE71",
          500: "#EE9644", // primary orange
          600: "#D8833C",
          700: "#B06B32"
        },
        ink: "#2B2B2B"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 8px 20px rgba(0,0,0,.06)"
      }
    }
  },
  plugins: []
};

export default config;
module.exports = config;
