module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'josephin': ['"josephin-sans"', 'sans-serif']
    },
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'light-grey': '#eef0eb',
        'cream': '#f2efe9',
        'deep-blue': '#284b63',
      },
      height: {
        '120': '30rem',
      }
    },
  },
  plugins: [],
}
