// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    // Global ignores
    ignores: ['dist/**', 'node_modules/**'],
  },
  // Base configurations
  js.configs.recommended,
  // TypeScript configurations
  ...tseslint.configs.recommended,
  // Prettier configuration (disables rules that conflict with Prettier)
  eslintConfigPrettier
)
