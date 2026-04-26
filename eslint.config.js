import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import perfectionist from 'eslint-plugin-perfectionist'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    plugins: {
      import: importPlugin,
      perfectionist,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.app.json'],
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',

      // Import cycle detection
      'import/no-cycle': ['error', { maxDepth: 2, ignoreExternal: true }],
      'import/no-self-import': 'error',
      'import/no-duplicates': 'error',

      // Deterministic ordering (Perfectionist)
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          newlinesBetween: 1,
          groups: ['type', 'builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          internalPattern: ['^@/.*'],
        },
      ],
      'perfectionist/sort-named-imports': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      'perfectionist/sort-named-exports': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      'perfectionist/sort-exports': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      'perfectionist/sort-objects': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      'perfectionist/sort-enums': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      'perfectionist/sort-union-types': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      'perfectionist/sort-intersection-types': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
    },
  },
  prettier,
)
