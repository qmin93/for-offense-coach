import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Theme system colors (CSS variable based)
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          elevated: "var(--bg-elevated)",
        },
        border: {
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
        },
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        error: {
          DEFAULT: "var(--error)",
          soft: "var(--error-soft)",
        },
        // Field & canvas colors
        field: {
          DEFAULT: "var(--field-bg)",
          bg: "var(--field-bg)",
          "line-1yd": "var(--field-line-1yd)",
          "line-5yd": "var(--field-line-5yd)",
          "line-10yd": "var(--field-line-10yd)",
          los: "var(--field-los)",
          label: "var(--field-label)",
          hash: "var(--field-hash)",
        },
        // Diagram colors
        route: {
          DEFAULT: "var(--route)",
          selected: "var(--route-selected)",
        },
        block: {
          run: "var(--block-run)",
          pass: "var(--block-pass)",
        },
        motion: "var(--motion)",
        landmark: "var(--landmark)",
        // Player colors
        player: {
          offense: "var(--player-offense)",
          defense: "var(--player-defense)",
        },
        // Legacy support (for backward compatibility)
        "field-green": "#2d5a27",
        "field-line": "#ffffff",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        focus: "var(--focus-ring)",
      },
      transitionTimingFunction: {
        "ease-out-custom": "var(--ease-out)",
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
