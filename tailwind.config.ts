import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        field: {
          green: "#2d5a27",
          line: "#ffffff",
        },
        offense: {
          primary: "#1e40af",
          secondary: "#3b82f6",
        },
        defense: {
          primary: "#dc2626",
          secondary: "#f87171",
        },
      },
    },
  },
  plugins: [],
};

export default config;
