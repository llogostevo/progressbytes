import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primaryColor: {
          DEFAULT: '#14B8A6',
        },
        secondaryColor: {
          DEFAULT: '#E76F51',
        },
        tertiaryColor: {
          DEFAULT: '#F4A261',
        },
        mainText: {
          DEFAULT: '#0A0A0A',
        },
        mutedText: {
          DEFAULT: '#2C3E50',
        }, 
        fluroGreen: {
          DEFAULT: '#35cc35',
        }
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-red-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-gray-500',

  ],
}
export default config
