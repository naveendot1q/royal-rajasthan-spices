import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: {
      colors: {
        "royal-gold": {
          DEFAULT: "#B8860B",
          light: "#DAA520",
          50:  "#FDF8E7",
          100: "#F9ECBF",
          200: "#F3D872",
          300: "#EDCA3A",
          400: "#DAA520",
          500: "#B8860B",
          600: "#9A6F09",
          700: "#7A5607",
          800: "#5C4005",
          900: "#3D2B03",
        },
        "maroon": {
          DEFAULT: "#6B1A1A",
          50:  "#FCF0F0",
          100: "#F5CCCC",
          200: "#E88888",
          300: "#D84444",
          400: "#B82020",
          500: "#6B1A1A",
          600: "#5A1515",
          700: "#481010",
          800: "#360C0C",
          900: "#240808",
        },
        "desert-sand": "#F5E6C8",
        "palace-ivory": "#FDF6E3",
        "jodhpur-blue": {
          DEFAULT: "#1A3A5C",
          light: "#2E6B9E",
          50: "#EBF4FB",
          100: "#C7E0F3",
          200: "#8FC4E7",
          300: "#57A8DB",
          400: "#2E6B9E",
          500: "#1A3A5C",
          600: "#153050",
          700: "#102644",
          800: "#0B1C38",
          900: "#06112C",
        },
        "emerald-spice": {
          DEFAULT: "#1A6B4A",
          50: "#EBF7F1",
          500: "#1A6B4A",
        },
        "saffron": {
          DEFAULT: "#E8820C",
          50: "#FEF3E7",
          500: "#E8820C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "rajasthan-pattern": "url('/patterns/rajasthan-bg.svg')",
        "gold-gradient": "linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%)",
      },
      boxShadow: {
        "gold": "0 4px 24px rgba(184, 134, 11, 0.25)",
        "gold-lg": "0 8px 48px rgba(184, 134, 11, 0.35)",
        "maroon": "0 4px 24px rgba(107, 26, 26, 0.25)",
      },
      animation: {
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
