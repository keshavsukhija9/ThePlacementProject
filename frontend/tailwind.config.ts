import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#131318",
        surface: "#131318",
        border: "#1E1E2A",
        primary: "#f97316",
        secondary: "#ffcc99",
        accent: "#f97316", // mapped
        success: "#10B981",
        warning: "#F59E0B",
        error: "#ffb4ab",
        
        // New theme additions
        "surface-container-lowest": "#0e0e13",
        "surface-container-low": "#1b1b20",
        "surface-container": "#1f1f25",
        "surface-container-high": "#2a292f",
        "surface-container-highest": "#35343a",
        "on-surface": "#e4e1e9",
        "on-surface-variant": "#c7c4d7",
        "on-primary": "#ffffff",
        "inverse-on-surface": "#303036",
        "surface-bright": "#39383e",
        "outline-variant": "#464554",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        h1: ["24px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "500" }],
        h2: ["20px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "500" }],
        body: ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["13px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: {
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "48": "48px",
      },
      borderRadius: {
        DEFAULT: "8px",
        btn: "6px",
      },
    },
  },
  plugins: [],
};
export default config;
