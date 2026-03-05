// FILENAME: eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Dossiers à ignorer partout
  {
    ignores: ["assets/**", "build/**", "dist/**", "reports/**", "node_modules/**"],
  },

  // Base JS
  js.configs.recommended,

  // Bloc React + JSX
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },
    settings: { react: { version: "detect" } },
    rules: {
      // Considérer les imports JSX comme “utilisés”
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",

      // ➜ autosuppression des imports inutilisés en --fix
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Divers
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/jsx-no-duplicate-props": "error",
      "no-const-assign": "error",
      "react/no-unescaped-entities": "warn",

      // Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
