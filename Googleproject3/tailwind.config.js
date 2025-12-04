/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This line tells Tailwind to scan ALL files ending in .html, .js, .jsx, and .ts, .tsx 
    // located inside the 'src' directory (and its subdirectories).
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}