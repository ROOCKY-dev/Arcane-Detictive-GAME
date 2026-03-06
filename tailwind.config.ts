import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medieval color palette from UI_DESIGN.md
        parchment: {
          dark: "#2D1B0E",   // Primary Background — Deep Parchment Brown
          DEFAULT: "#4A3520", // Secondary Background — Warm Leather
          light: "#F5E6C8",   // Text (Light) — Cream Parchment
        },
        ink: {
          dark: "#1A0E05",    // Text (Dark) — Dark Ink
        },
        arcane: {
          gold: "#FFD700",    // Accent — Arcane Gold (magic glow)
          blue: "#4A9EFF",    // Accent — Mystic Blue (code/active)
          green: "#2ECC71",   // Accent — Emerald Green (success)
          purple: "#9B59B6",  // Accent — Spell Purple (error/misfire)
          red: "#E74C3C",     // Accent — Fire Red (danger)
        },
        border: {
          gold: "#C9A04E",    // UI Border Glow — Soft Gold
        },
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],        // Medieval headings
        inter: ["Inter", "sans-serif"],     // Body text
        fira: ["Fira Code", "monospace"],   // Code/SQL editor
      },
      boxShadow: {
        "arcane-gold": "0 0 10px #FFD700, 0 0 20px #FFD70066",
        "arcane-blue": "0 0 10px #4A9EFF, 0 0 20px #4A9EFF66",
        "arcane-purple": "0 0 10px #9B59B6, 0 0 20px #9B59B666",
        "arcane-green": "0 0 10px #2ECC71, 0 0 20px #2ECC7166",
      },
      animation: {
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 5px #FFD700" },
          "50%": { boxShadow: "0 0 20px #FFD700, 0 0 40px #FFD70066" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { opacity: "0.6" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
