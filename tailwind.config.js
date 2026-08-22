/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          200: "#D5DAE1"
        },
        black: {
          DEFAULT: "#000",
          500: "#1D2235"
        },
        blue: {
          500: "#2b77e7"
        }
      },
      fontFamily: {
        worksans: ["Work Sans", "sans-serif"],
        poppins: ['Poppins', "sans-serif"]
      },
      // Optical sizing. Tailwind's default scale ships every size at
      // letter-spacing: normal, which is only correct in the middle of the
      // range — the site was rendering 36-60px headings at normal or slightly
      // positive tracking, which is the clearest "untouched defaults" tell in
      // a type system.
      //
      // Type set large needs to be tightened and type set small needs to be
      // opened up, because spacing that reads correctly at 16px reads loose at
      // 60px and cramped at 12px. Line height tightens on the same curve, for
      // the same reason. Pairing both with the size means every `text-*`
      // utility carries its own optics and nothing has to be remembered.
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1.125rem', letterSpacing: '0.01em'   }],
        sm:   ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.005em'  }],
        base: ['1rem',     { lineHeight: '1.625rem', letterSpacing: '-0.006em' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem',  letterSpacing: '-0.011em' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.014em' }],
        '2xl': ['1.5rem',  { lineHeight: '2rem',     letterSpacing: '-0.019em' }],
        '3xl': ['1.875rem',{ lineHeight: '2.25rem',  letterSpacing: '-0.021em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem',   letterSpacing: '-0.024em' }],
        '5xl': ['3rem',    { lineHeight: '1.08',     letterSpacing: '-0.028em' }],
        '6xl': ['3.75rem', { lineHeight: '1.05',     letterSpacing: '-0.032em' }],
        '7xl': ['4.5rem',  { lineHeight: '1.02',     letterSpacing: '-0.035em' }],
        '8xl': ['6rem',    { lineHeight: '1',        letterSpacing: '-0.038em' }],
      },
      letterSpacing: {
        // Small uppercase labels run the other way — at 12-14px, caps need air
        // to stay legible. Was hardcoded as tracking-[0.15em] in two places.
        label: '0.15em',
      },
      boxShadow: {
        card: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'neon': '0 0 5px theme(colors.blue.400), 0 0 20px theme(colors.blue.600)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'gradient-slow': 'gradient 8s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 6s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'morph': 'morph 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'type': 'type 2.5s steps(40, end)',
        'cursor-blink': 'blink 0.75s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(66, 153, 225, 0.5), 0 0 10px rgba(66, 153, 225, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(66, 153, 225, 0.8), 0 0 20px rgba(66, 153, 225, 0.5)' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '40% 60% 30% 70% / 30% 40% 70% 60%' },
          '75%': { borderRadius: '60% 40% 70% 30% / 70% 30% 60% 40%' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        type: {
          '0%': { width: '0' },
          '99.9%': { borderRight: '0.15em solid orange' },
          '100%': { width: '100%', borderRight: 'none' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: 'orange' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100ch',
            color: 'rgba(255, 255, 255, 0.8)',
            h1: {
              color: '#fff',
            },
            h2: {
              color: '#fff',
            },
            h3: {
              color: '#fff',
            },
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              },
            },
            code: {
              color: '#8b5cf6',
            },
          },
        },
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}