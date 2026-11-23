import { defineConfig } from "vite";

export default defineConfig({
  base: "/footprint/",
  esbuild: { jsx: "automatic" },
  build: {
    outDir: "../../footprint",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/footprint.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
