module.exports = {
  "extends": "eslint:recommended",
  "env": {
    browser: true
  },
  "globals": {
    "inject": true,
    "expect": true,
    "angular": true
  },
  "rules": {
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-console": "warn",
    "chai-expect/missing-assertion": 2,
    "chai-expect/terminating-properties": 1
  }
}
