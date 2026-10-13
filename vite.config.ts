import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { prerender } from "./scripts/prerender";

const FALLBACK_SUPABASE_PROJECT_ID = "dojcuaoydegwqrzldtmp";
const FALLBACK_SUPABASE_URL = `https://${FALLBACK_SUPABASE_PROJECT_ID}.supabase.co`;
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvamN1YW95ZGVnd3FyemxkdG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTkyMjYsImV4cCI6MjA5MDUzNTIyNn0.VE3uTke-6KF5QEQ5TkeNKioOew4FiPfUqHfRHHJLrAQ";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const projectId = env.VITE_SUPABASE_PROJECT_ID || FALLBACK_SUPABASE_PROJECT_ID;
  const supabaseUrl = env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger(), mode !== "development" && { name: "seo-prerender", apply: "build" as const, closeBundle: { order: "post" as const, sequential: true, handler: async () => { try { await prerender(); } catch (e) { console.warn("[prerender] failed", e); } } } }].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    define: {
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(projectId),
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(publishableKey),
    },
  };
});
