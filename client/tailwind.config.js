/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#E4DFDA", // Light beige
        sec: "#48A9A6", // Teal
        accent: "#16A34A", // Green
      },
    },
  },
  plugins: [],
};
