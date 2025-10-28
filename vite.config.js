import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // 👈 sorgt dafür, dass Render relative Pfade nutzt
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    host: true,
  },
});
