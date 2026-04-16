import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';
import devServer from '@hono/vite-dev-server';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        Sitemap({ hostname: 'https://kanji.next-haru.com', dynamicRoutes: ['/privacy', '/terms', '/refund'] }),
        devServer({
          entry: 'app.ts',
          exclude: [/^.*\.tsx?$/, /^.*\.(ts|tsx)$/, /^\/assets\/.*/, /^\/src\/.*/]
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
