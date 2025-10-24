import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        'neon-pink': '#E91E63',
        'neon-cyan': '#00ffff',
        'neon-yellow': '#fbbf24',
        gold: {
          DEFAULT: '#FFD700',
          light: '#FCD34D',
          medium: '#FFC107',
          dark: '#FFA500',
        },
        'casino-pink': {
          DEFAULT: '#FF00FF',
          hot: '#FF0080',
          rose: '#DB2777',
        },
        'casino-cyan': {
          DEFAULT: '#00FFFF',
          blue: '#0099FF',
        },
        'casino-dark': {
          DEFAULT: '#1a0f2e',
          darker: '#0D1117',
          header: '#101010',
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      transitionDuration: {
        '600': '600ms',
        '800': '800ms',
        '2500': '2500ms',
      },
      scale: {
        '102': '1.02',
        '105': '1.05',
        '110': '1.10',
        '120': '1.20',
      },
      boxShadow: {
        'jackpot-intense': '0 0 40px rgba(234, 179, 8, 0.8), 0 0 80px rgba(234, 179, 8, 0.6), 0 0 120px rgba(234, 179, 8, 0.4), 0 0 160px rgba(234, 179, 8, 0.2)',
        'jackpot-medium': '0 0 30px rgba(234, 179, 8, 0.6), 0 0 60px rgba(234, 179, 8, 0.4), 0 0 90px rgba(234, 179, 8, 0.2)',
      },
      dropShadow: {
        'jackpot': ['0 0 30px rgba(253, 224, 71, 0.8)', '0 0 60px rgba(253, 224, 71, 0.5)'],
        'jackpot-intense': ['0 0 50px rgba(253, 224, 71, 1)', '0 0 100px rgba(253, 224, 71, 1)', '0 0 150px rgba(253, 224, 71, 0.8)'],
      },
    },
  },
  plugins: [],
};
export default config;
