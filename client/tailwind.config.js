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
                "primary": "#CCA43B",
                "primary-dark": "#B08D33",
                "primary-metallic": "#D4AF37",
                "background-light": "#FAFAFA",
                "background-dark": "#121212",
                "surface-light": "#FFFFFF",
                "surface-dark": "#1E1E1E",
                "text-light": "#333333",
                "text-dark": "#E0E0E0",
                "gold-light": "#F3E5AB",
                "accent-gold": "#C5A028",
            },
            fontFamily: {
                "display": ["Playfair Display", "serif"],
                "body": ["Lato", "sans-serif"],
                "sans": ["Lato", "sans-serif"],
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
