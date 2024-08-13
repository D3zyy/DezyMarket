/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#8300ff",
          "primary-content": "#e2d9ff",
          "secondary": "#00efff",
          "secondary-content": "#001416",
          "accent": "#0000ff",
          "accent-content": "#c6dbff",
          "neutral": "#19272a",
          "neutral-content": "#cccfd0",
          "base-100": "#e5ffff",
          "base-200": "#c7dede",
          "base-300": "#aabebe",
          "base-content": "#121616",
          "info": "#00c9ff",
          "info-content": "#000f16",
          "success": "#00cf99",
          "success-content": "#001008",
          "warning": "#a05b00",
          "warning-content": "#edddd0",
          "error": "#ff246f",
          "error-content": "#160004",
        }, 
      },
      "dim"
 
    ],
    darkTheme: "dim",
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers, and responsive class names)
    themeRoot: ":root",
  },
};