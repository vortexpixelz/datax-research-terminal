import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(async () => {
  const { default: react } = await import("@vitejs/plugin-react")

  return {
    plugins: [react(), tsconfigPaths()],
    test: {
      environment: "jsdom",
      globals: true,
    },
  }
})
