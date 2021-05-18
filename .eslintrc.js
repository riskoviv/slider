module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:fsd/all',
  ],
  globals: {
    JQuery: 'readonly',
    ISliderPluginOptions: 'readonly',
    ISliderPluginGlobalOptions: 'readonly',
    ISliderPluginFunction: 'readonly',
    ISliderPlugin: 'readonly',
  },
  ignorePatterns: ['dist'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'fsd',
  ],
  rules: {
    'import/extensions': ['error', {
      ts: 'never',
    }],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: [
          '.ts',
        ],
      },
    },
  },
};
