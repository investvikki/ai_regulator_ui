/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',     // Blue-600
        secondary: '#64748B',   // Slate-500
        background: '#F8FAFC',  // Slate-50
        sidebar: '#1E293B',     // Gray-800
        surface: '#FFFFFF',     // White
        text: '#0F172A',        // Slate-900
        mutedText: '#6B7280',   // Gray-500
        success: '#16A34A',     // Green-600
        error: '#DC2626',       // Red-600
        border: '#E2E8F0',      // Gray-200
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      transitionProperty: {
        'width': 'width',
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
}