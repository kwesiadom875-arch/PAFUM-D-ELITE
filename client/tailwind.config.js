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
                "primary": "#ecb613",
                "primary-metallic": "#D4AF37",
                "background-light": "#f8f8f6",
                "background-light-alt": "#F9F9F7",
                "background-dark": "#221d10",
                "background-dark-alt": "#1a1a1a",
                "text-light": "#333333",
                "text-dark": "#E5E5E5",
                "accent-gold": "#C5A028",
                "gold": "#c5a059",
                "gold-hover": "#d4af68",
            },
            fontFamily: {
                "display": ["Noto Serif", "Playfair Display", "serif"],
                "sans": ["Noto Sans", "Lato", "sans-serif"],
                "body": ["Lato", "sans-serif"],
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
