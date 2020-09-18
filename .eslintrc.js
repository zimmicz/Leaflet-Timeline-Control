module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'typescript',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-var': 'error',
    'semi': 'error',
    'indent': ['error', 2],
    'no-multi-spaces': 'error',
    'space-in-parens': 'error',
    'no-multiple-empty-lines': 'error',
    'prefer-const': 'error',
    'no-use-before-define': 'error'
  }
};
