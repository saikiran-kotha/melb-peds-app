import globals from "globals";
import tseslint from "typescript-eslint";
import eslintRecommended from "@eslint/js"; // For eslint:recommended
// For prettier, you'll typically use eslint-config-prettier to turn off conflicting rules
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores
  // {
  //   ignores: ["dist/", "node_modules/", ".devcontainer/"],
  // },

  // Equivalent of eslint:recommended
  eslintRecommended.configs.recommended,

  // TypeScript configurations
  ...tseslint.configs.recommended, // This is a shorthand for recommended type-aware rules if you have tsconfig.json setup for linting

  // If you want more granular control or were using specific configs from tseslint:
  // {
  //   files: ["**/*.ts", "**/*.tsx"], // Apply only to TypeScript files
  //   extends: [
  //     ...tseslint.configs.recommended,
  //     // ...tseslint.configs.stylistic, // If you want stylistic rules
  //   ],
  //   languageOptions: {
  //     parser: tseslint.parser,
  //     parserOptions: {
  //       project: "./tsconfig.json", // Or specific tsconfig for linting
  //     },
  //   },
  //   rules: {
  //     // Your TypeScript specific rules from the old config
  //     // "@typescript-eslint/no-unused-vars": "warn",
  //   },
  // },

  // Prettier configuration (to disable ESLint rules that conflict with Prettier)
  // This should usually be the last configuration in the array.
  eslintConfigPrettier,

  // Global language options (if not specified in more specific blocks)
  {
    languageOptions: {
      globals: {
        ...globals.node, // or globals.browser, globals.es2021, etc.
      },
    }
  },

  // Your custom global rules (from the `rules` block in your old config)
  // {
  //   rules: {
  //     // "no-console": "warn",
  //   }
  // }
); 