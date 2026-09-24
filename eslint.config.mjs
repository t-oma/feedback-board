import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,

  // Replaces `eslint-config-next/typescript`, which is typescript-eslint's
  // untyped `recommended`. The rules worth having here are the ones that read
  // types: a dropped promise in a Server Action still type-checks.
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Relaxed for numbers only: `${n}` and `${String(n)}` produce the same
      // text, so the wrapper adds noise without catching anything. The rule's
      // own defaults also allow `any`, booleans, nullish values and RegExps,
      // and a partial options object falls back to them, so every option is
      // spelled out to keep `strictTypeChecked`'s settings for the rest. It
      // reads types, so it sits above the block that switches type-aware
      // rules off for the untyped config files.
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: false,
          allowBoolean: false,
          allowNever: false,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: false,
        },
      ],
    },
  },

  // The config files below are not part of the TypeScript program, so there are
  // no types to check them against.
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // Every type import is marked, which `verbatimModuleSyntax` then enforces
      // at the compiler level. Both spellings satisfy the rule, so a module that
      // also supplies values keeps one import with an inline `type`, while a
      // type-only module gets its own `import type` line.
      "@typescript-eslint/consistent-type-imports": "error",
      // Flipped from the stylistic default, which asks for `interface`. Roughly
      // half of the types here cannot be one -- unions, `z.infer` results and
      // `Omit<...>` aliases -- so a rule with exceptions would cost more than it
      // settles. `interface` is still the only option for module augmentation,
      // and there it reads as the deliberate exception it is.
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },

  prettierConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-e2e/**",
    "out/**",
    "build/**",
    "storybook-static/**",
    "next-env.d.ts",
    // A git worktree checked out inside the repository. Unlike Prettier, flat
    // config does not read `.gitignore`, so it has to be named again here --
    // otherwise linting this checkout also lints every other one.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
