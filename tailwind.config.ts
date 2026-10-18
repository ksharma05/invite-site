import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        ink: "var(--color-ink)",
        "ink-muted": "var(--color-ink-muted)",
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        /* Phase B — gold accent + tinted card surface */
        gold: "var(--color-gold)",
        "gold-bright": "var(--color-gold-bright)",
        "gold-deep": "var(--color-gold-deep)",
        "gold-line": "var(--color-gold-line)",
        "card-tint": "var(--color-card-tint)",
        rule: "var(--color-rule)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        devanagari: ["var(--font-devanagari)", "var(--font-heading)", "serif"],
      },
      borderRadius: {
        ornate: "var(--radius-ornate)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        ornate: "var(--shadow-ornate)",
      },
      transitionTimingFunction: {
        invite: "var(--motion-ease)",
      },
    },
  },
  plugins: [],
};

export default config;
