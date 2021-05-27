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
    ISliderModel: 'readonly',
    EventName: 'readonly',
    ISliderSubView: 'readonly',
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
    'linebreak-style': ['error', 'windows'],
    'eol-last': 'warn',
    'no-unused-vars': 'off',
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
