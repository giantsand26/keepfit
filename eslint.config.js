export default [
  {
    ignores: ['dist/', '.git/'],
  },
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        indexedDB: 'readonly',
        sessionStorage: 'readonly',
        localStorage: 'readonly',
        Notification: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        location: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        setInterval: 'readonly',
        fetch: 'readonly',
        caches: 'readonly',
        self: 'readonly',
        clients: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
    },
  },
];
