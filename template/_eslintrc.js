module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "standard"
  ],
  plugins: [
    'html'
  ],
  rules: {
    'vue/require-prop-type-constructor': 'off',
    'vue/require-valid-default-prop': 'off',
    // enable additional rules
    camelcase: 0,
    "quotes": ["error", "single"],
    // override default options for rules from base configurations
    // disable rules from base configurations
    "no-console": 0,
  },
  parserOptions: {
    parser: "babel-eslint"
  }
}
