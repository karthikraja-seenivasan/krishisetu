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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          green: {
            100: "#E4F0E5",
            700: "#2D7A3A",
            800: "#235F2D",
          },
          saffron: "#E89B2C",
          success: "#5BA66B",
          warning: "#F4A82C",
          danger: "#D14B3B",
          cream: "#FAF7F0",
          textPrimary: "#1A2E1F",
          textSecondary: "#5B5249",
          textMuted: "#8A8175",
          border: "#E8E2D5",
        },
      },
      borderRadius: {
        button: "12px",
        card: "16px",
        input: "12px",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "var(--font-inter)", "sans-serif"],
        kannada: ["var(--font-noto-sans-kannada)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
