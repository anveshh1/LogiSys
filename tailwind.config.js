export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        surface: {
          dark: '#0d0d0d',
          cream: '#f5f2ee',
          'cream-alt': '#edeae5',
        },
        accent: {
          DEFAULT: '#ff3c3c',
          dim: 'rgba(255, 60, 60, 0.12)',
          border: 'rgba(255, 60, 60, 0.4)',
        },
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
}
