module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'plugin:fsd/all',
  ],
  globals: {
    $: 'readonly',
    JQuery: 'readonly',
    IPluginOptions: 'readonly',
    PartialPluginOptions: 'readonly',
    IPluginGlobalOptions: 'readonly',
    IPluginFunction: 'readonly',
    ISliderPlugin: 'readonly',
    IModel: 'readonly',
    IView: 'readonly',
    EventName: 'readonly',
    ISubView: 'readonly',
    IEventEmitter: 'readonly',
    EventHandler: 'readonly',
    EventsStorage: 'readonly',
    OptionsObject: 'readonly',
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
    TypeOfValues: 'readonly',
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
