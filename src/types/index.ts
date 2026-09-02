export type WithoutClassName<T> = Omit<T, "className">;

export type SearchParams = {
  [key: string]: string | string[] | undefined;
};
