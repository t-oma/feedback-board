import { randomUUID } from "node:crypto";

// A UUID is lowercase hexadecimal groups joined by single hyphens, so it is a
// valid slug that no other test will claim.
export function uniqueSlug() {
  return randomUUID();
}

// Values no product can have. `products.db.test.ts` checks that the table
// refuses each of them.
export const slugsTheTableRejects: readonly string[] = [
  "Orbit-cli",
  "orbit--cli",
  "-orbit",
  "orbit-",
  "orbit cli",
  "ab",
];
