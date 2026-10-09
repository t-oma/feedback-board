// The form validates these bounds in the browser and the database enforces
// them in its column types, so both read them from here. They used to live in
// the database schema, and a client module importing them from there would
// have pulled Drizzle and the table definition into the browser bundle.
export const MIN_PRODUCT_NAME_LENGTH = 2;
export const MAX_PRODUCT_NAME_LENGTH = 80;
export const MIN_PRODUCT_SLUG_LENGTH = 3;
export const MAX_PRODUCT_SLUG_LENGTH = 48;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 500;

// Lowercase letters and digits in words joined by single hyphens. A source
// string rather than a `RegExp`, so that a larger pattern, such as the board
// path `getAuthBackTarget` matches, can embed it.
export const PRODUCT_SLUG_PATTERN = "[a-z0-9]+(?:-[a-z0-9]+)*";
