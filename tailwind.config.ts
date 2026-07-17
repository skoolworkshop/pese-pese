import type { Config } from "tailwindcss";

// Centrale designtokens. Kleuren zijn geïnspireerd op een warme kaarttafel
// met subtiele Surinaamse accenten (groen, rood, wit, goud).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Vilttafel-groen als hoofdvlak
        felt: {
          900: "#0c3222",
          800: "#0f3d2a",
          700: "#155238",
          600: "#1b6647",
          500: "#238a5f",
        },
        // Surinaams goud/amber accent
        gold: {
          500: "#f2b03d",
          400: "#f5c15f",
          300: "#f8d38a",
        },
        // Surinaams rood
        blood: {
          600: "#c8102e",
          500: "#e01f3d",
        },
        cream: "#faf6ec",
        ink: "#12251c",
      },
      fontFamily: {
        display: [
          "ui-rounded",
          '"Hiragino Maru Gothic ProN"',
          "Quicksand",
          '"Segoe UI"',
          "system-ui",
          "sans-serif",
        ],
        body: [
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "0.9rem",
        panel: "1.4rem",
      },
      boxShadow: {
        card: "0 6px 18px rgba(0,0,0,0.28)",
        lift: "0 10px 30px rgba(0,0,0,0.35)",
        glow: "0 0 0 4px rgba(242,176,61,0.55)",
      },
      keyframes: {
        flipIn: {
          "0%": { transform: "rotateY(90deg) scale(0.9)", opacity: "0" },
          "100%": { transform: "rotateY(0deg) scale(1)", opacity: "1" },
        },
        popIn: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "70%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        dealIn: {
          "0%": { transform: "translateY(-40px) scale(0.8)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        shakeX: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        rise: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        flipIn: "flipIn 0.35s ease-out",
        popIn: "popIn 0.28s ease-out",
        dealIn: "dealIn 0.3s ease-out",
        shakeX: "shakeX 0.3s ease-in-out",
        rise: "rise 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
