import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "lp-red": "#8d0202",
        "lp-black": "#050505",
        "lp-white": "#f2f2f2",
        "lp-cream": "#d9d9d9",
      },
      fontFamily: {
        "army-rust": ["var(--lp-font-display)", "sans-serif"],
        "retro-computer": ["var(--lp-font-ui)", "monospace"],
        "dirty-war": ["var(--lp-font-display)", "sans-serif"],
        "vhs-gothic": ["var(--lp-font-display)", "sans-serif"],
        display: ["var(--lp-font-display)", "sans-serif"],
        mono: ["var(--lp-font-ui)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
