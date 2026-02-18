/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Brand golds
                "primary": "#CCA43B",
                "primary-dark": "#B08D33",
                "primary-metallic": "#D4AF37",
                "accent-gold": "#C5A028",
                "gold": "#c5a059",
                "gold-hover": "#d4af68",
                "gold-light": "#F3E5AB",

                // Backgrounds
                "background-light": "#f8f8f6",
                "background-light-alt": "#F9F9F7",
                "background-dark": "#221d10",
                "background-dark-alt": "#1a1a1a",
                "surface-light": "#FFFFFF",
                "surface-dark": "#1E1E1E",

                // Text
                "text-light": "#333333",
                "text-dark": "#E5E5E5",
                "text-main": "#181611",
                "text-muted": "#6b7280",

                // Borders
                "border-light": "#e6e3db",
                "border-dark": "#3a3528",
            },
            fontFamily: {
                // Noto stack from stitched designs, with Lato fallback
                "display": ["Noto Serif", "Playfair Display", "serif"],
                "sans": ["Noto Sans", "Lato", "sans-serif"],
                "body": ["Lato", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "4px",
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fill-up': 'fillUp 2.5s ease-in-out infinite',
                'fade-in': 'fadeIn 1s ease-out forwards',
                'progress': 'progress 2s ease-in-out infinite',
            },
            keyframes: {
                fillUp: {
                    '0%': { height: '0%' },
                    '50%': { height: '100%' },
                    '100%': { height: '0%' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                progress: {
                    '0%': { transform: 'translateX(-100%)' },
                    '50%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(100%)' },
                }
            }
        },
    },
    plugins: [],
}
