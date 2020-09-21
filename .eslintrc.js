module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2019, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  parser: 'babel-eslint',
  plugins: ['prettier'],
  extends: ['standard', 'prettier', 'plugin:import/recommended'],
  globals: {
    App: true,
    BaaS: true,
    Component: true,
    getApp: true,
    getCurrentPages: true,
    Page: true,
    requirePlugin: true,
    wx: true,
  },
  rules: {
    'prettier/prettier': [
      2,
      {
        bracketSpacing: false,
        printWidth: 120,
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      },
    ],
    'handle-callback-err': 0,
    'prefer-promise-reject-errors': [2, {allowEmptyReject: true}],
    'space-before-function-paren': [2, 'never'],
    'no-prototype-builtins': 0,
    'comma-dangle': 0,
    camelcase: 0,
    eqeqeq: 0,
  },
}
