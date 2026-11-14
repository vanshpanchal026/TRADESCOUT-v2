import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#ffffff",
          hover: "#4338CA",
        },
        highlight: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        accent: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
        },
        bull: {
          DEFAULT: "#16A34A",
          light: "#22c55e",
          dark: "#15803d",
        },
        bear: {
          DEFAULT: "#DC2626",
          light: "#ef4444",
          dark: "#b91c1c",
        },
        rrg: {
          leading: "#2563EB",
          improving: "#0284C7",
          weakening: "#D97706",
          lagging: "#DB2777",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};

export default config;
