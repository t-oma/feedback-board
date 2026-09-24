/**
 * Every component in this directory owns its own styling, so none of them
 * accepts `className`. Wrapping the underlying props in this type is what makes
 * that refusal a compile error rather than a convention. `types.test-d.ts`
 * fails `pnpm typecheck` for any export that skips the wrapper, and a new
 * component directory needs its own line there.
 */
export type WithoutClassName<T> = Omit<T, "className">;
