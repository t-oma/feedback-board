// A theme token's value as the page has it, such as `--color-accent`, so a
// check compares against the theme rather than a copy of its value.
export function themeColor(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
