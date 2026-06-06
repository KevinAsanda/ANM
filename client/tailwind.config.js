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
          DEFAULT: 'var(--color-primary, #1D4ED8)',
          hover: 'var(--color-primary-hover, #1E40AF)',
          light: 'var(--color-primary-light, #DBEAFE)',
        },
        surface: 'var(--color-surface, #FFFFFF)',
        background: 'var(--color-background, #F1F5F9)',
        border: {
          DEFAULT: 'var(--color-border, #E2E8F0)',
          focus: 'var(--color-border-focus, #3B82F6)',
        },
        text: {
          DEFAULT: 'var(--color-text, #0F172A)',
          muted: 'var(--color-text-muted, #475569)',
          inverse: 'var(--color-text-inverse, #FFFFFF)',
        },
        error: {
          DEFAULT: 'var(--color-error, #DC2626)',
          bg: 'var(--color-error-bg, #FEE2E2)',
        },
        success: {
          DEFAULT: 'var(--color-success, #16A34A)',
          bg: 'var(--color-success-bg, #DCFCE7)',
        },
        warning: {
          DEFAULT: 'var(--color-warning, #D97706)',
          bg: 'var(--color-warning-bg, #FEF3C7)',
        },
        status: {
          pending: {
            bg: 'var(--status-pending-bg, #FEF3C7)',
            text: 'var(--status-pending-text, #92400E)',
          },
          inprogress: {
            bg: 'var(--status-inprogress-bg, #DBEAFE)',
            text: 'var(--status-inprogress-text, #1E40AF)',
          },
          completed: {
            bg: 'var(--status-completed-bg, #DCFCE7)',
            text: 'var(--status-completed-text, #14532D)',
          },
          cancelled: {
            bg: 'var(--status-cancelled-bg, #F1F5F9)',
            text: 'var(--status-cancelled-text, #475569)',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
