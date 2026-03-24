import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    // Vite v8 injects `<script type="module" crossorigin>` regardless of the
    // rollup output format. Strip both attributes and add `defer` so the app
    // loads correctly from file://:
    //   • Chrome blocks type="module" from null-origin file:// (CORS policy).
    //   • crossorigin is meaningless without type="module".
    //   • defer is required because type="module" is implicitly deferred — a
    //     plain <script> in <head> executes before <body> is parsed, making
    //     document.getElementById('root') return null (React error #299).
    // apply:'build' keeps the dev server untouched (it serves ESM natively).
    {
      name: 'file-url-compatible-script',
      apply: 'build' as const,
      transformIndexHtml(html: string): string {
        return html
          .replace(/ type="module"/g, '')
          .replace(/ crossorigin/g, '')
          .replace(/(<script) (src=)/, '$1 defer $2')
      },
    },
  ],
  build: {
    outDir: 'dist',
    // IIFE format: bundles everything into one classic script with no ES module
    // semantics. Combined with removing type="module" above, this ensures
    // Chrome loads the script without CORS enforcement under file://.
    //
    // Terser minifier: Rolldown's built-in oxc minifier (Vite 8 default) produces
    // a runtime crash when minifying the IIFE bundle — it incorrectly mangles a
    // property access, causing "Cannot read properties of undefined (reading 'a')".
    // Terser handles IIFE minification correctly.
    minify: 'terser',
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
    // Playwright e2e specs are not run by Vitest — they use their own runner.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      // text: printed to the terminal after each run.
      // html: browsable report written to coverage/.
      // lcov: machine-readable format consumed by CI tools and editor plugins.
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**'],
      exclude: [
        'src/main.tsx', // app entry point — no testable logic
        'src/vite-env.d.ts', // type declarations only
      ],
    },
  },
})
