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
        // Core palette — PRD § 6
        background:  "#0A0A0F",
        surface:     "#12121A",
        border:      "#1E1E2A",
        primary:     "#f97316",  // Orange accent (user choice)
        secondary:   "#ffcc99",
        accent:      "#f97316",
        success:     "#10B981",
        warning:     "#F59E0B",
        error:       "#EF4444",

        // Surface elevation tokens
        "surface-container-lowest":   "#0e0e13",
        "surface-container-low":      "#1b1b20",
        "surface-container":          "#1f1f25",
        "surface-container-high":     "#2a292f",
        "surface-container-highest":  "#35343a",

        // Text
        "on-surface":           "#e4e1e9",
        "on-surface-variant":   "#8A8A9A",
        "on-primary":           "#ffffff",

        // Misc
        "surface-bright":    "#39383e",
        "outline-variant":   "#464554",
        "inverse-on-surface": "#303036",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // PRD § 6 typography scale
        h1:    ["24px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "500" }],
        h2:    ["20px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "500" }],
        body:  ["15px", { lineHeight: "1.5", fontWeight: "400" }],
        small: ["13px", { lineHeight: "1.4", fontWeight: "400" }],
        label: ["11px", { lineHeight: "1.4", fontWeight: "600", letterSpacing: "0.08em" }],
      },
      spacing: {
        // 4px baseline grid — PRD § 6
        "2":  "8px",
        "3":  "12px",
        "4":  "16px",
        "6":  "24px",
        "8":  "32px",
        "12": "48px",
      },
      borderRadius: {
        DEFAULT: "8px",
        btn:     "6px",
        card:    "8px",
        xl:      "12px",
      },
      maxWidth: {
        content: "1120px",
      },
      animation: {
        "fade-in":  "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
