const globals = require('globals')
const babelParser = require('@babel/eslint-parser')

module.exports = [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2017,
        ecmaFeatures: {
          jsx: true,
          experimentalObjectRestSpread: true,
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      eqeqeq: 'error',
      'no-invalid-this': 'error',
      'no-return-assign': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'off', // Disabled - allows return statements for code clarity
      'no-use-before-define': [
        'error',
        { functions: false, classes: true, variables: false },
      ],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'block-spacing': 'error',
      'comma-dangle': 'off',
      'comma-spacing': 'error',
      'comma-style': 'error',
      'computed-property-spacing': 'error',
      'func-call-spacing': 'error',
      'implicit-arrow-linebreak': 'off',
      'keyword-spacing': 'error',
      'no-mixed-operators': 'off',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'no-tabs': 'error',
      'no-unneeded-ternary': 'error',
      'no-whitespace-before-property': 'error',
      'nonblock-statement-body-position': 'error',
      'object-property-newline': [
        'error',
        { allowAllPropertiesOnSameLine: true },
      ],
      'quote-props': ['error', 'as-needed'],
      semi: ['error', 'never'],
      'semi-spacing': 'error',
      'space-before-blocks': 'error',
      'space-in-parens': 'error',
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'arrow-spacing': 'off',
      'no-confusing-arrow': 'off',
      'no-duplicate-imports': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
    },
  },
]
