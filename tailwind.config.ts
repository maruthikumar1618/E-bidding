import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "24px",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Ecommerce Design System Colors
        primary: {
          DEFAULT: "#000000",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        accent: {
          light: "#F5F5F5",
          medium: "#E0E0E0",
          dark: "#4A4A4A",
        },
        semantic: {
          error: "#DC2626",
          success: "#16A34A",
          sale: "#EF4444",
          discount: "#F97316",
        },
        // Legacy shadcn colors for compatibility
        border: "#E0E0E0",
        input: "#E0E0E0",
        ring: "#000000",
        background: "#FFFFFF",
        foreground: "#000000",
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#4A4A4A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "hero": ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        "h1": ["36px", { lineHeight: "1.3", fontWeight: "700" }],
        "h2": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "h3": ["18px", { lineHeight: "1.5", fontWeight: "600" }],
        "body": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        "small": ["12px", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["10px", { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        lg: "8px",
        md: "4px",
        sm: "2px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.1)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.15)",
        "navbar": "0 1px 3px rgba(0,0,0,0.1)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      screens: {
        "mobile": "320px",
        "tablet": "768px",
        "desktop": "1024px",
        "wide": "1440px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;