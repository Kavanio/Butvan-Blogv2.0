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
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        hand: ["var(--font-shantell-sans)", "cursive"],
        handwriting: ["'Caveat'", "'Kaiti SC'", "'STKaiti'", "'KaiTi'", "'楷体'", "cursive", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        gray: {
          bg: "var(--color-gray-bg)",
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
          1000: "var(--color-gray-1000)",
          1100: "var(--color-gray-1100)",
          1200: "var(--color-gray-1200)",
        },
        "preview-bg": "var(--color-preview-bg)",
      },
      fontSize: {
        micro: ["11px", { lineHeight: "14px" }],
        caption: ["12px", { lineHeight: "16px" }],
        "body-sm": ["13px", { lineHeight: "18px" }],
        body: ["14px", { lineHeight: "20px" }],
        lede: ["15px", { lineHeight: "22px" }],
      },
      boxShadow: {
        card: "0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0px 1px 2px -1px rgba(0, 0, 0, 0.06), 0px 2px 4px 0px rgba(0, 0, 0, 0.04)",
        "card-hover": "0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px -1px rgba(0, 0, 0, 0.08), 0px 2px 4px 0px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
