import { defineConfig } from "vite";

export default defineConfig({
  root: process.cwd(),
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html"
    }
  }
});
