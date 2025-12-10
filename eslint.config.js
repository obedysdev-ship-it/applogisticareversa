import reactPlugin from 'eslint-plugin-react'
import js from '@eslint/js'

export default [
  { ignores: ['Components/**', 'Pages/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: true, document: true, navigator: true, localStorage: true, sessionStorage: true, fetch: true, self: true, caches: true, crypto: true, Blob: true, URL: true, Notification: true, setTimeout: true, clearTimeout: true }
    },
    plugins: { react: reactPlugin },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
      'no-empty': 'off'
    }
  }
]
