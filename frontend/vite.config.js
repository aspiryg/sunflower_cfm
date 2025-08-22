import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // target: "https://sunflowercfm.azurewebsites.net",
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
