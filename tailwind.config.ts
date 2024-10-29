import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      width: {
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },
      colors: {
        'soft-blue': '#AEC6CF',
        'peach': '#FFDAB9',
        'light-green': '#B0E57C',
        'soft-pink': '#F9BFCE',
        "navy": "#1E3A8A",
        "light-blue": "#1D4ED8",
        "light-gray": "#374151",
        "sky-blue": "#83AEEC",
        "border": "hsl(var(--border))",
        "input": "hsl(var(--input))",
        "ring": "hsl(var(--ring))",
        "background": "hsl(var(--background))",
        "foreground": "hsl(var(--foreground))",
        "primary": {
          "DEFAULT": "hsl(var(--primary))",
          "foreground": "hsl(var(--primary-foreground))"
        },
        "secondary": {
          "DEFAULT": "hsl(var(--secondary))",
          "foreground": "hsl(var(--secondary-foreground))"
        },
        "destructive": {
          "DEFAULT": "hsl(var(--destructive))",
          "foreground": "hsl(var(--destructive-foreground))"
        },
        "muted": {
          "DEFAULT": "hsl(var(--muted))",
          "foreground": "hsl(var(--muted-foreground))"
        },
        "accent": {
          "DEFAULT": "hsl(var(--accent))",
          "foreground": "hsl(var(--accent-foreground))"
        },
        "popover": {
          "DEFAULT": "hsl(var(--popover))",
          "foreground": "hsl(var(--popover-foreground))"
        },
        "card": {
          "DEFAULT": "hsl(var(--card))",
          "foreground": "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        "lg": "var(--radius)",
        "md": "calc(var(--radius) - 2px)",
        "sm": "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          "from": {
            "height": "0"
          },
          "to": {
            "height": "var(--radix-accordion-content-height)"
          }
        },
        "accordion-up": {
          "from": {
            "height": "var(--radix-accordion-content-height)"
          },
          "to": {
            "height": "0"
          }
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
