module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'plugin:fsd/all',
  ],
  globals: {
    $: 'readonly',
    JQuery: 'readonly',
    IPluginOptions: 'readonly',
    IPluginGlobalOptions: 'readonly',
    IPluginFunction: 'readonly',
    ISliderPlugin: 'readonly',
    IModel: 'readonly',
    IView: 'readonly',
    EventNames: 'readonly',
    ISubView: 'readonly',
    IEventEmitter: 'readonly',
    EventsStorage: 'readonly',
    IHandleView: 'readonly',
    IBaseView: 'readonly',
    ITipView: 'readonly',
    HandleBounds: 'readonly',
    IScaleView: 'readonly',
    HandleParams: 'readonly',
    IPluginStateOptions: 'readonly',
    IProgressView: 'readonly',
    IPluginPublicMethods: 'readonly',
    Axis: 'readonly',
    Dimension: 'readonly',
    IHTMLElement: 'readonly',
    ViewParams: 'readonly',
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
    'no-console': ['warn', { allow: ['warn', 'error'] }],
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
