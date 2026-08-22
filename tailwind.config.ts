import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Facebook Blue Theme Tokens
        darkBg: "#0B0F19",
        darkBgSecondary: "#101524",
        surface: "#141B2D",
        card: "#192238",
        cardElevated: "#1E2A45",
        borderDark: "rgba(255, 255, 255, 0.08)",
        
        // Brand Primary & Accents (Facebook Blue #1877F2)
        primary: "#1877F2",
        secondary: "#0866FF",
        accent: "#2D88FF",
        accentPink: "#EC4899",
        accentPurple: "#8B5CF6",
        
        // Status Indicators
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",

        // Typography Colors
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        textMuted: "#64748B",

        // Light Theme Tokens
        lightBg: "#F0F2F5",
        lightSurface: "#FFFFFF",
        lightCard: "#FFFFFF",
        lightBorder: "#E4E6EB",
        lightTextPrimary: "#050505",
        lightTextSecondary: "#65676B",
        lightTextMuted: "#8A8D91",
        lightBrand: "#1877F2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        btn: "11px",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-subtle": "pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-up": "floatUp 2.2s ease-out forwards",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.03)" },
        },
        floatUp: {
          "0%": { opacity: "1", transform: "translateY(0) scale(0.85)" },
          "100%": { opacity: "0", transform: "translateY(-110px) scale(1.3)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
