export type WithoutClassName<T> = Omit<T, "className">;

export type SearchParams = Record<string, string | string[] | undefined>;
