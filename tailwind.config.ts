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
        "lp-red": "#8e1111",
        "lp-black": "#050505",
        "lp-white": "#ece7da",
        "lp-cream": "#d6d1c4",
      },
      fontFamily: {
        display: ["var(--lp-font-display)", "sans-serif"],
        label: ["var(--lp-font-label)", "sans-serif"],
        ui: ["var(--lp-font-ui)", "monospace"],
        body: ["var(--lp-font-body)", "monospace"],
        mono: ["var(--lp-font-ui)", "monospace"],
      },
      transitionTimingFunction: {
        lp: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
