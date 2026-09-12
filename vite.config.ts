import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base is the GitHub Pages project path. Change when the repo is renamed.
export default defineConfig({
  plugins: [react()],
  base: '/wpr-auto-loan/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        // Sidebar slideshow — its own page so the embed stays light.
        mini: fileURLToPath(new URL('mini.html', import.meta.url)),
      },
    },
  },
});
