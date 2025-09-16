// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import csp from 'vite-plugin-csp';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    csp({
      policies: {
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com',
        ],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
      },
    }),
  ],
});
