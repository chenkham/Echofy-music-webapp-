/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1DB954",
          50: "#E8F8F0",
          100: "#C7EFDC",
          200: "#9FE4C5",
          300: "#6DD9A8",
          400: "#42CE8F",
          500: "#1DB954",
          600: "#17A348",
          700: "#128D3C",
          800: "#0D7730",
          900: "#086124",
        },
        secondary: {
          DEFAULT: "#8A2BE2",
          light: "#B968F0",
          dark: "#6A1FC7",
        },
        accent: {
          DEFAULT: "#FF69B4",
          light: "#FFB3D9",
          dark: "#D9478F",
        },
        "bg-dark": "#0a0a0a",
        "bg-light": "#1a1a1a",
        "bg-elevated": "#242424",
        "bg-glass": "rgba(255, 255, 255, 0.08)",
        "text-primary": "#ffffff",
        "text-secondary": "#b3b3b3",
        "text-muted": "#6a6a6a",
        danger: "#f44336",
        warning: "#ff9800",
        success: "#4caf50",
        info: "#2196f3",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
      boxShadow: {
        neon: "0 0 10px rgba(29, 185, 84, 0.5), 0 0 20px rgba(29, 185, 84, 0.3)",
        "neon-lg":
          "0 0 20px rgba(29, 185, 84, 0.6), 0 0 40px rgba(29, 185, 84, 0.4)",
        glow: "0 0 30px rgba(138, 43, 226, 0.5)",
        card: "0 10px 30px rgba(0, 0, 0, 0.3)",
        "card-hover":
          "0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(29, 185, 84, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
