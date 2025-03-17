/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      lemonmilk: ["lemonmilk", "sans-serif"],
      lemonmilklight: ["lemonmilklight", "sans-serif"],
      lemonmilklightitalic: ["lemonmilklightitalic", "sans-serif"],
    },
    extend: {
      animation: {
        glow: "glow 1.5s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px 0 rgba(72, 187, 120, 0.7)" },
          "50%": { boxShadow: "0 0 20px 5px rgba(72, 187, 120, 0.7)" },
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
