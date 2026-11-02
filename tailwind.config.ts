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
        app: {
          bg: "#F2F6FC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          navy: "#1E3A8A",
          blue: "#2563EB",
          emerald: "#10B981",
          amber: "#F59E0B",
          crimson: "#DC2626",
          slate: "#64748B",
          subtle: "#94A3B8",
        },
      },
      boxShadow: {
        card: "0 2px 10px rgba(15, 23, 42, 0.04)",
        float: "0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)",
      },
      borderRadius: {
        "2xl": "16px",
      },
      padding: {
        safe: "env(safe-area-inset-bottom, 24px)",
      },
    },
  },
  plugins: [],
};
export default config;

