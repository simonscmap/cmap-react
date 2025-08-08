module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'react-app', // Use the existing react-app config
    'plugin:react/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react'],
  settings: {
    react: {
      version: '16.13.1', // Matches your package.json React version
    },
  },
  rules: {
    // Disable or adjust problematic rules to warnings instead of errors
    'react/prop-types': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react/jsx-key': 'warn',
    'react/display-name': 'warn',
    'no-unused-vars': 'warn',
    'no-useless-escape': 'warn',
    'no-shadow': 'warn',
    'no-empty': 'warn',
    'no-unreachable': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'brace-style': 'warn',
    
    // Allow console for now since it's widely used in the codebase
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
    },
  ],
};