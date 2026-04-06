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
        background: "#0A0A0F",
        surface: "#12121A",
        border: "#1E1E2A",
        primary: "#E8E8ED",
        secondary: "#8A8A9A",
        accent: "#6366F1",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
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
