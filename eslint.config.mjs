import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

const OUTLINE_NONE_MESSAGE =
  "`outline-none` leaves no focus indicator in forced-colors mode. Use `outline-hidden`, or a visible ring with `focus-ring`.";

const FOCUS_RING_MESSAGE =
  "Draw the focus ring with `focus-ring` or `focus-ring-inside`, which `src/app/globals.css` defines once.";

// The width and offset of an outline on `:focus-visible`, which only the
// focus ring utilities set. Recolouring the browser's own outline stays
// allowed.
const WRITTEN_OUT_RING = String.raw`/\bfocus-visible:(?:-?outline-offset-|outline-[0-9])/`;

const LAYERS_SPEC = "docs/superpowers/specs/2026-10-13-action-slices-design.md";

const NO_UPPER_LAYER = {
  regex: "^@/(app|features)(/|$)",
  message: `Import only from a lower layer, and inside a slice use a relative path. See ${LAYERS_SPEC}.`,
};

const NO_ENTITY_BUT_CONTRACTS = {
  regex: "^@/entities/(?![^/]+/contracts$)",
  message: `Only an entity's \`contracts.ts\` is open to its own layer and the one below. See ${LAYERS_SPEC}.`,
};

// A file `depth` folders below its slice's root leaves the slice with one
// more `../` than that.
function noLeavingSlice(depth) {
  return {
    regex: `^(\\.\\./){${String(depth + 1)}}`,
    message:
      "A relative path stays inside its slice. Reach another layer through `@/`.",
  };
}

function restrictImports(files, patterns) {
  return {
    files,
    rules: { "no-restricted-imports": ["error", { patterns }] },
  };
}

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
      // Flipped from the stylistic default, which asks for `interface`. Many
      // of the types here cannot be one -- unions, `z.infer` results and
      // `Omit<...>` aliases -- so a rule with exceptions would cost more than it
      // settles. `interface` is still the only option for module augmentation,
      // and there it reads as the deliberate exception it is.
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },

  // Tailwind 4's `outline-none` sets only `outline-style: none`, and
  // forced-colors mode drops `box-shadow`, so an element that shows focus as a
  // ring has no indicator left there. `outline-hidden` keeps a transparent
  // outline in that mode, which the browser repaints in a system colour.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: String.raw`Literal[value=/\boutline-none\b/]`,
          message: OUTLINE_NONE_MESSAGE,
        },
        {
          selector: String.raw`TemplateElement[value.raw=/\boutline-none\b/]`,
          message: OUTLINE_NONE_MESSAGE,
        },
        {
          selector: `Literal[value=${WRITTEN_OUT_RING}]`,
          message: FOCUS_RING_MESSAGE,
        },
        {
          selector: `TemplateElement[value.raw=${WRITTEN_OUT_RING}]`,
          message: FOCUS_RING_MESSAGE,
        },
      ],
    },
  },

  // The import direction of the layers. For the files two blocks match, the
  // later block's options replace the earlier ones rather than add to them,
  // so each block lists every pattern its files need, and the slices get one
  // block per layer and folder depth. A folder deeper than the depths below
  // needs blocks of its own.
  restrictImports(
    ["src/{components,shared,server}/**/*.{ts,tsx}"],
    [NO_UPPER_LAYER, NO_ENTITY_BUT_CONTRACTS],
  ),
  ...[0, 1].flatMap((depth) => {
    const files = `${"*/".repeat(depth)}*.{ts,tsx}`;

    return [
      restrictImports(
        [`src/features/*/${files}`],
        [NO_UPPER_LAYER, noLeavingSlice(depth)],
      ),
      restrictImports(
        [`src/entities/*/${files}`],
        [NO_UPPER_LAYER, NO_ENTITY_BUT_CONTRACTS, noLeavingSlice(depth)],
      ),
    ];
  }),
  // Every layer may read a `contracts.ts`, which is safe only while it reads
  // nothing itself.
  restrictImports(
    ["src/{features,entities}/*/contracts.ts"],
    [
      {
        regex: ".",
        message:
          "`contracts.ts` imports nothing, so that every layer can read it.",
      },
    ],
  ),
  // A route reaches its own files relatively. Climbing to `../_ui/` reaches
  // the UI of a segment above, which a nested route may use; climbing into
  // another folder reaches another route's.
  restrictImports(
    ["src/app/**/*.{ts,tsx}"],
    [
      {
        regex: "^@/app(/|$)",
        message: "Import a route's own files with a relative path.",
      },
      {
        regex: "^(\\.\\./)+[^./_][^/]*/",
        message: `A route uses its own \`_ui/\` and those of the segments above it. Move what two routes share down a layer. See ${LAYERS_SPEC}.`,
      },
    ],
  ),
  // The proxy is bundled apart from the app; `src/proxy.ts` says what broke
  // when it imported the auth configuration.
  restrictImports(
    ["src/proxy.ts"],
    [
      {
        regex: String.raw`^@/server/(auth|db)(/|$)|\.server$`,
        message:
          "The proxy must not share the app's database client. Ask Better Auth over HTTP, as `src/proxy.ts` does.",
      },
    ],
  ),

  prettierConfig,
  // eslint-config-next already ignores `.next`, `out`, `build` and
  // `next-env.d.ts`, and global ignores add up rather than replace each other.
  // Unlike Prettier, flat config does not read `.gitignore`, so anything else
  // that is generated has to be named here.
  globalIgnores([
    // The e2e build, which `next.config.ts` moves out of `.next`.
    ".next-e2e/**",
    "storybook-static/**",
    // A git worktree checked out inside the repository. Without this, linting
    // this checkout also lints every other one.
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
