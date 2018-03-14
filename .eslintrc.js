module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb-base', 'prettier'],
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  rules: {
    'no-bitwise': 0,
    'no-continue': 0,
    'no-new-func': 0,
    'no-plusplus': 0,
    'comma-dangle': 0,
    'no-cond-assign': 0,
    'no-use-before-define': 0,
    'no-case-declarations': 0,
    'no-underscore-dangle': 0,
    'no-restricted-syntax': 0,
    'function-paren-newline': 0,
    'class-methods-use-this': 0,
    'no-multi-assign': ['warn'],
    'no-nested-ternary': ['warn'],
    'no-param-reassign': ['warn'],
    'no-mixed-operators': ['warn'],
    'prefer-destructuring': ['warn'],
    'max-len': ['error', { code: 80, ignoreComments: true }]
  }
};
