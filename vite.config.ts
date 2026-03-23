import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    // Strip `crossorigin` attributes from the built HTML so the app loads
    // correctly when opened via file:// (Chrome enforces CORS on null-origin
    // requests, which blocks crossorigin-tagged module scripts and stylesheets).
    {
      name: 'remove-crossorigin',
      transformIndexHtml(html: string): string {
        return html.replace(/ crossorigin/g, '')
      },
    },
  ],
  build: {
    outDir: 'dist',
    // Disable the modulePreload polyfill — it injects a hidden iframe to probe
    // browser support, which Chrome also blocks under file:// (null origin).
    // Chrome fully supports modulepreload natively so the polyfill is redundant.
    modulePreload: { polyfill: false },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
