import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        grotesk: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        cyan: "#00d4ff",
        violet: "#7b2ff7",
      },
      animation: {
        drift: "drift 25s ease-in-out infinite alternate",
        pulse2: "pulse2 1.5s infinite",
        spin: "spin 0.8s linear infinite",
        "slide-in": "slideIn 0.35s cubic-bezier(.68,-.55,.265,1.55)",
        "fade-up": "fadeUp 0.4s ease forwards",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "100%": { transform: "translate(80px,80px) scale(1.15)" },
        },
        pulse2: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.7)" },
        },
        slideIn: {
          from: { right: "-420px" },
          to: { right: "24px" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
