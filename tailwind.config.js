// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        }
      },
    },
    plugins: [
      require('daisyui'),
      require('@tailwindcss/forms'),
    ],
    daisyui: {
      themes: [
        {
          smartrw: {
            "primary": "#3b82f6",
            "primary-content": "#ffffff",
            "secondary": "#f59e0b",
            "accent": "#10b981",
            "neutral": "#374151",
            "base-100": "#ffffff",
            "base-200": "#f9fafb",
            "base-300": "#f3f4f6",
            "info": "#0ea5e9",
            "success": "#22c55e",
            "warning": "#f59e0b",
            "error": "#ef4444",
          },
        },
      ],
      base: true,
      styled: true,
      utils: true,
    },
  }