module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2019, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {jsx: true},
  },
  plugins: ['prettier'],
  extends: ['standard', 'standard-react', 'prettier', 'plugin:import/recommended'],
  globals: {},
  rules: {
    'prettier/prettier': [
      2,
      {
        bracketSpacing: false,
        jsxSingleQuote: true,
        printWidth: 120,
        semi: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      },
    ],
    'handle-callback-err': 0,
    'react/display-name': 0,
    'react/prop-types': 0,
    'react/jsx-handler-names': 0,
    'prefer-promise-reject-errors': [2, {allowEmptyReject: true}],
    'space-before-function-paren': [2, {"anonymous": "never", "named": "never", "asyncArrow": "always"}],
    'no-prototype-builtins': 0,
    'comma-dangle': 0,
    camelcase: 0,
    eqeqeq: 0,
  },
}
