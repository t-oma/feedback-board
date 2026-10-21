/**
 * Every component in this directory owns its own styling, so none of them
 * accepts `className`. Wrapping the underlying props in this type is what makes
 * that refusal a compile error rather than a convention. `types.test.ts`
 * fails for any directory here with an export that skips the wrapper.
 */
export type WithoutClassName<T> = Omit<T, "className">;
