import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        airbnb: "#FF385C",
        airbnbDark: "#222222",
        airbnbBorder: "#DDDDDD",
        airbnbGray: "#717171",
      },
    },
  },

  plugins: [],
};

export default config;