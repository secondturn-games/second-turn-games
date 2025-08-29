/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        primary: '#29432B',           // Dark Green
        accent: '#D95323',            // Vibrant Orange
        highlight: '#F2C94C',         // Warm Yellow
        
        // Extended Accent Colors
        teal: '#2DB7A3',              // Success, new features
        coral: '#FF6B6B',             // Error states
        lavender: '#A78BFA',          // Info, secondary actions
        
        // Background & Surface
        background: '#E6EAD7',        // Light Beige
        surface: '#FFFFFF',           // White
        'surface-50': '#F7F8F4',      // Subtle backgrounds
        'surface-100': '#F0F2E9',     // Hover states
        
        // Text Colors
        text: '#1B1B1B',              // Primary text
        'text-secondary': '#6B7280',  // Secondary text
        'text-muted': '#9CA3AF',      // Muted text
        
        // Border Colors
        border: '#E5E7EB',            // Standard borders
        'border-light': '#F3F4F6',    // Light borders
        
        // Legacy Color Support
        'light-beige': '#E6EAD7',
        'light-beige-50': '#F7F8F4',
        'light-beige-100': '#F0F2E9',
        'light-beige-200': '#E6EAD7',
        'light-beige-300': '#D8DCC8',
        'vibrant-orange': '#D95323',
        'vibrant-orange-50': '#FEF2F0',
        'vibrant-orange-100': '#FDE4E0',
        'vibrant-orange-200': '#FBC7BC',
        'vibrant-orange-300': '#F8A395',
        'vibrant-orange-400': '#F47A66',
        'vibrant-orange-500': '#D95323',
        'vibrant-orange-600': '#C44A1F',
        'warm-yellow': '#F2C94C',
        'warm-yellow-50': '#FFFBEB',
        'warm-yellow-100': '#FEF3C7',
        'warm-yellow-200': '#FDE68A',
        'warm-yellow-300': '#FCD34D',
        'warm-yellow-400': '#F2C94C',
        'warm-yellow-500': '#EAB308',
        'dark-green': '#29432B',
        'dark-green-50': '#F0F4F0',
        'dark-green-100': '#E1E9E1',
        'dark-green-200': '#C3D3C3',
        'dark-green-300': '#A5BDA5',
        'dark-green-400': '#87A787',
        'dark-green-500': '#29432B',
        'dark-green-600': '#1F331F',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'sans-serif'],
        display: ['var(--font-righteous)', 'sans-serif'],
        'game-titles': ['var(--font-bebas-neue)', 'sans-serif'],
      },
      spacing: {
        // 2px grid system for ultra-compact design
        'xs': '0.125rem',   // 2px
        'sm': '0.25rem',    // 4px
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
      },
      borderRadius: {
        // Reduced border radius for professional look
        'xs': '0.125rem',   // 2px
        'sm': '0.25rem',    // 4px
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        'medium': '0 4px 12px 0 rgb(0 0 0 / 0.12)',
        'strong': '0 8px 25px 0 rgb(0 0 0 / 0.15)',
      },
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '0.875rem', // 14px
        'lg': '1rem',       // 16px
        'xl': '1.125rem',   // 18px
        '2xl': '1.375rem',  // 22px
        '3xl': '1.75rem',   // 28px
      },
    },
  },
  plugins: [],
}

