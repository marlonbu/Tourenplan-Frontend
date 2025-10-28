import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Render braucht relative Pfade
  build: {
    outDir: "dist",
  },
});
