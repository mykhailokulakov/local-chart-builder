import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    // Vite v8 injects `<script type="module" crossorigin>` regardless of the
    // rollup output format. Both attributes must be stripped so the app loads
    // from file://: Chrome enforces CORS on module scripts from null-origin
    // (file://) and blocks them. A plain <script src> has no such restriction.
    {
      name: 'file-url-compatible-script',
      transformIndexHtml(html: string): string {
        return html.replace(/ type="module"/g, '').replace(/ crossorigin/g, '')
      },
    },
  ],
  build: {
    outDir: 'dist',
    // IIFE format: bundles everything into one classic script with no ES module
    // semantics. Combined with removing type="module" above, this ensures
    // Chrome loads the script without CORS enforcement under file://.
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
