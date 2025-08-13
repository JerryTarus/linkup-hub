import type { Config } from "tailwindcss"

const config = {
  // ... (shadcn config)
  theme: {
    container: {
      // ...
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... (shadcn colors)
        'brand-primary': '#3A3A3A',
        'brand-bg': '#F5EFE6',
        'brand-accent': '#4A90E2',
      },
      // ...
    },
  },
  // ...
} satisfies Config

export default config