import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "vinter-cyan-light": "#5CD4DF",
        "vinter-cyan-dark": "#7DE8F2",
        "vinter-bg-dark": "#000000",
        "vinter-bg-light": "#EFEFEF",
      },
    },
  },
};

export default config;
