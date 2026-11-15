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
        sans: ["var(--font-manrope)", "var(--font-hanken)", "var(--font-inter)", "Manrope", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        brand: {
          DEFAULT: "#0171e4",
          50: "#c2f9ff",
          100: "#8feaff",
          500: "#0171e4",
          900: "#002a7a",
          950: "#001b4e",
        },
        primary: {
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
          hover: "#4f46e5",
        },
        sidebar: "#141420",
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
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
        },
        bull: {
          DEFAULT: "#22c55e",
          light: "#4ade80",
          dark: "#16a34a",
        },
        bear: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        caution: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        rrg: {
          leading: "#2563EB",
          improving: "#0284C7",
          weakening: "#D97706",
          lagging: "#DB2777",
        },
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.22, 0.65, 0.25, 1)",
        "ease-out": "cubic-bezier(0.22, 0.65, 0.25, 1)",
        "stc-ease": "cubic-bezier(0.22, 0.65, 0.25, 1)",
      },
      transitionDuration: {
        "150": "150ms",
        "160": "160ms",
        "200": "200ms",
        "350": "350ms",
        "450": "450ms",
      },
      boxShadow: {
        "stc-card": "rgba(16, 24, 40, 0.05) 0px 1px 2px 0px, rgba(26, 40, 90, 0.32) 0px 30px 70px -30px, rgba(16, 26, 51, 0.06) 0px 0px 0px 1px",
        "stc-glow": "rgba(255, 255, 255, 0.08) 0px 0px 0px 1px, rgba(1, 113, 228, 0.35) 0px 20px 60px -20px",
      },
      keyframes: {
        slide: {
          "0%": { opacity: "0", transform: "translate3d(0, 8px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        hcUp: {
          "0%": { opacity: "0", transform: "translate3d(0px, 24px, 0px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        "sc-shine": {
          "0%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        slide: "slide 0.35s cubic-bezier(0.22, 0.65, 0.25, 1) forwards",
        hcUp: "hcUp 0.45s cubic-bezier(0.22, 0.65, 0.25, 1) forwards",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
  ],
};

export default config;
