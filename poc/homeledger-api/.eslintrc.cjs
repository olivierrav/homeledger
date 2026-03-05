module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  env: {
    node: true,
    es2020: true
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  ignorePatterns: ["dist"],
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-explicit-any": "off"
  }
};