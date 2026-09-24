<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Comments

A comment is a claim that nothing runs. Most of the wrong comments found in this repository were wrong on the day they were written, not made wrong by a later change, so the rules below are about writing them as much as about keeping them.

1. **Say why, not what.** A comment earns its place when the code cannot say it: a constraint, a trade-off, the bug that shaped it (`src/proxy.ts` is the model). Do not restate the code.
2. **Verify every claim before writing it.** Check what a library does by default in its source under `node_modules`, what another file contains by opening it, and what a test covers by running it. Do it in the same change. If you cannot check a claim, do not state it as fact.
3. **Prefer a check to a claim.** If something must always be true, make it fail when it is not: a type, a type test (`src/components/types.test-d.ts`), a unit test, a story `play` function, a lint rule. The comment then only points at the check.
4. **Do not describe other code.** A claim about another file, a whole directory, or code that does not exist yet goes stale silently, because the diff that breaks it never touches the comment. Point to the other place instead of paraphrasing it, or share the code so there is nothing to keep in sync.
5. **No counts, and no lists of things that grow.** "Roughly half of the types" or "domain and schema tests" is wrong as soon as one more is added.
6. **History belongs in the commit message.** `git log` keeps how the code got here, tied to the diff it explains. A comment keeps only what a reader of this line needs now.
7. **Changing code means re-reading its comments.** Before committing, read the comments in and around what changed, and grep for the identifiers whose name or behaviour changed.
