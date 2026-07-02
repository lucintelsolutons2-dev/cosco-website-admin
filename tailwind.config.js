/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF1F1", 100: "#FFDFDF", 200: "#FFC2C2", 300: "#FF9A9A",
          400: "#FB5C5C", 500: "#EE2B2B", 600: "#D10A12", 700: "#AE0810",
          800: "#8F0A12", 900: "#761016", 950: "#420507",
        },
        ink: {
          50: "#F6F6F7", 100: "#E9E9EC", 200: "#C9C9D1", 300: "#A2A2AE",
          400: "#61616E", 500: "#4A4A57", 600: "#33333E", 700: "#23232B",
          800: "#17171D", 900: "#0E0E12", 950: "#08080B",
        },
      },
    },
  },
  plugins: [],
};
