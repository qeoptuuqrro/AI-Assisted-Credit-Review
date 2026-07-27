import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "github" ? "/AI-Assisted-Credit-Review/" : "/",
  plugins: [react()],
  server: {
    port: 5182,
    strictPort: true,
  },
  preview: {
    port: 5182,
    strictPort: true,
  },
}));
