import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Field & game colors
        field: {
          DEFAULT: "hsl(var(--field))",
          lines: "hsl(var(--field-lines))",
          endzone: "hsl(var(--field-endzone))",
        },
        // Action colors
        route: "hsl(var(--route))",
        block: "hsl(var(--block))",
        motion: "hsl(var(--motion))",
        // Unit colors
        offense: "hsl(var(--offense))",
        defense: "hsl(var(--defense))",
        // Legacy support
        "field-green": "#2d5a27",
        "field-line": "#ffffff",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
