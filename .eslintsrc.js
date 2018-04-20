module.exports = {
  env: {
    browser: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    "goog": false,
    "jpad": false,
    "munimap": false,
    "ol": false,
    "assert": false,
    "munimapx": false,
    "turf": false,
    "WebFont": false
  },
  rules: {
    'array-bracket-spacing': 'error',
    'block-scoped-var': 'error',
    'brace-style': 'error',
    'comma-dangle': ['error', 'never'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'curly': 'error',
    'eol-last': 'error',
    'indent': ['error', 2, {VariableDeclarator: 2, SwitchCase: 1}],
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'max-len': ["error", { "code": 80 }],
    'no-cond-assign': 'error',
    'no-console': 'error',
    'no-const-assign': 'error',
    'no-control-regex': 'error',
    'no-debugger': 'error',
    'no-delete-var': 'error',
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'error',
    'no-empty-character-class': 'error',
    'no-eq-null': 'error',
    'no-ex-assign': 'error',
    'no-extra-semi': 'error',
    'no-fallthrough': 'error',
    'no-func-assign': 'error',
    'no-inner-declarations': ['error', 'functions'],
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-mixed-spaces-and-tabs': ['error', false],
    'no-negated-in-lhs': 'error',
    'no-obj-calls': 'error',
    'no-octal': 'error',
    'no-redeclare': 'error',
    'no-regex-spaces': 'error',
    'no-sparse-arrays': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-unexpected-multiline': 'error',
    'no-unreachable': 'error',
    'no-unused-vars': ['error', {vars: 'all', args: 'none'}],
    'object-curly-spacing': 'error',
    'prefer-const': 'error',
    'quotes': ['error', 'single'],
    'semi': 'error',
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', 'never'],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error'
  }
};
