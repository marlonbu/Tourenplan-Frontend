import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Standardkonfiguration für Vite + React + Render
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    historyApiFallback: true, // sorgt für SPA-Routing im Dev-Modus
  },
});
