import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = (env.VITE_SUPABASE_URL ?? "").trim().replace(/\/$/, "");

  const server =
    target.length > 0
      ? {
          proxy: {
            "/supabase": {
              target,
              changeOrigin: true,
              secure: true,
              rewrite: (path: string) => path.replace(/^\/supabase/, ""),
            },
          },
        }
      : {};

  return {
    plugins: [react(), tailwindcss()],
    server,
  };
});
