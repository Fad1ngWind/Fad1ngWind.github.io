import tailwindcss from "tailwindcss";

export default {
  plugins: [tailwindcss({ darkMode: "class", content: ["./index.html", "./src/**/*.{ts,tsx,mjs}"] })],
};
