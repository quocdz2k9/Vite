import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/api/cfl": {
        target: "https://vgrapi-sea.vnggames.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(
            "/api/cfl",
            "/coordinator/api/v1/code/redeem",
          ),
      },
    },
  },
})
