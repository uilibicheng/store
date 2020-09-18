module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: ['standard', 'standard-react'],
  globals: {
    history: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'no-template-curly-in-string': 0,
    'arrow-parens': ['error', 'as-needed'],
    'comma-dangle': ['error', 'always-multiline'],
    'handle-callback-err': ['error', 'never'],
    'max-len': ['error', 120],
    'no-new': 0,
    'object-curly-spacing': ['error', 'never'],
    'react/jsx-no-bind': 0,
    'react/prop-types': 0,
    'space-before-function-paren': ['error', 'never'],
    'standard/no-callback-literal': 0,
    camelcase: 0,
    eqeqeq: 0,
    indent: ['error', 2],
    quotes: ['error', 'single'],
  },
}
