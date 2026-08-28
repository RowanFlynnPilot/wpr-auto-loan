import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base is the GitHub Pages project path. Change when the repo is renamed.
export default defineConfig({
  plugins: [react()],
  base: '/wpr-auto-loan/',
});
