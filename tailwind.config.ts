import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Carried from the EVCHARGEX rider app so both products share one identity.
        brand: {
          50: "#EEF4FF",
          100: "#DBE7FF",
          200: "#BBD0FF",
          300: "#8BB0FF",
          400: "#5586FB",
          500: "#1E63F0",
          600: "#1550D6",
          700: "#1340AC",
          800: "#163A88",
          900: "#17356C",
          DEFAULT: "#1E63F0",
        },
        success: { DEFAULT: "#16A34A", soft: "#DCFCE7", ink: "#0F7A38" },
        warn: { DEFAULT: "#F59E0B", soft: "#FEF3C7", ink: "#B45309" },
        danger: { DEFAULT: "#DC2626", soft: "#FEE2E2", ink: "#B91C1C" },
        info: { DEFAULT: "#2563EB", soft: "#DBEAFE", ink: "#1D4ED8" },
        ink: "#0B1420",
        muted: "#6B7684",
        faint: "#9AA4B2",
        line: "#E7EBF1",
        canvas: "#F2F5F9",
        surface: "#FFFFFF",
        // The dark navy of the sidebar in the designs.
        sidebar: {
          DEFAULT: "#0B1220",
          hover: "#141D30",
          muted: "#8A94A6",
          line: "#1B2639",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
        pop: "0 8px 24px rgba(16,24,40,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
