import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class' as const,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand: deep jade/teal
        brand: {
          50:  '#edfafa',
          100: '#d5f5f6',
          200: '#afecee',
          300: '#7edce2',
          400: '#16bdca',
          500: '#0694a2',
          600: '#047481',
          700: '#036672',
          800: '#05505c',
          900: '#014451',
        },
        // Accent: warm gold
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Dark background system
        surface: {
          900: '#080c14',
          800: '#0d1220',
          700: '#131929',
          600: '#1a2235',
          500: '#1e2a3d',
          400: '#253049',
          300: '#2d3a57',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error:   '#ef4444',
        info:    '#3b82f6',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        chinese: ['var(--font-noto-sc)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #080c14 0%, #0d1220 40%, #014451 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(13,18,32,0.9) 0%, rgba(6,148,162,0.1) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'teal-gradient': 'linear-gradient(135deg, #047481 0%, #0694a2 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(6,148,162,0.3)',
        'glow-gold': '0 0 20px rgba(245,158,11,0.3)',
        'glass':     '0 8px 32px rgba(0,0,0,0.4)',
        'card':      '0 4px 24px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-down':  'slideDown 0.4s ease-out',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
        'float':       'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
