import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Flat config is order-sensitive: later entries override earlier ones for the
// files they match. The two narrow blocks therefore come after the general one,
// or its `globals.browser` and its rule set would win over them.
export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Build config runs in Node, not the browser, so `process` and `require`
    // are real globals here rather than the undefined references the browser
    // environment reports them as.
    files: ['vite.config.js', 'tailwind.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // react-three-fiber renders three.js objects, not DOM elements, so `args`,
    // `position`, `intensity`, `attach` and `transparent` are valid props that
    // this rule can only check against the HTML attribute list. Scoped to the
    // one file with a scene in it rather than turned off globally, so a genuine
    // typo in ordinary JSX is still caught everywhere else.
    files: ['src/Components/HeroAnimation.jsx'],
    rules: {
      'react/no-unknown-property': 'off',
    },
  },
]
