import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { edgeFunctionsMiddleware } from './server/localEdgeFunctions';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Keep GEMINI_API_KEY on the server process only
  if (env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }

  return {
    plugins: [
      react(),
      {
        name: 'supabase-edge-functions-local-runner',
        configureServer(server) {
          server.middlewares.use(edgeFunctionsMiddleware());
        },
        configurePreviewServer(server) {
          server.middlewares.use(edgeFunctionsMiddleware());
        },
      },
    ],
    server: {
      port: 5173,
      host: true,
    },
    preview: {
      port: 5173,
      host: true,
    },
  };
});
