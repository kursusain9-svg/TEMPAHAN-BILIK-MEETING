import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Determine base path:
  // 1. Explicit VITE_BASE_PATH or BASE_URL env var if specified
  // 2. When running in GitHub Actions or GITHUB_PAGES=true, use repository path
  // 3. Otherwise default to '/' for local development and AI Studio environment
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || isGitHubActions;

  const defaultGhRepo = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/TEMPAHAN-BILIK-MEETING/';

  const base = process.env.VITE_BASE_PATH || (isGitHubPages ? defaultGhRepo : '/');

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': import.meta.dirname ?? path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

