import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'playwright-report', 'test-results'] },
  // CJS config files (if any)
  {
    files: ['**/*.cjs'],
    languageOptions: { globals: globals.node },
  },
  // Browser + TypeScript source
  {
    ...js.configs.recommended,
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2020 },
    },
  },
  ...tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
)
