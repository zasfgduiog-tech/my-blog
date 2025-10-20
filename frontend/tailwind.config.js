// tailwind.config.js

const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 您的项目文件路径
    "./src/**/*.{js,ts,jsx,tsx}",
    
    // NextUI 组件库的路径
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class", // NextUI 推荐开启暗黑模式
  plugins: [
    nextui(),
    require('@tailwindcss/typography'),
  ],
};