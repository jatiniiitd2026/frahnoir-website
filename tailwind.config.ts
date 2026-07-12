import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ember: {
          DEFAULT: "#9b1b1b",
          glow: "#c2410c",
        },
        velvet: {
          ink: "#0d0406",
          night: "#1a0509",
          wine: "#2a0710",
          burgundy: "#3b0d14",
          gold: "#c9a24b",
          goldlight: "#e7cd93",
          cream: "#f3ead8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        luxe: "0.35em",
        wider2: "0.45em",
      },
      backgroundImage: {
        "gold-sheen":
          "linear-gradient(180deg, #f3ead8 0%, #e7cd93 35%, #c9a24b 70%, #9c7a32 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
