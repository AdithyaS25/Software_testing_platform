/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          soft: "#eef2ff",
        },
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
