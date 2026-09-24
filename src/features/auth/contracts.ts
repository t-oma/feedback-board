// Better Auth enforces the password bounds itself on sign-up, so the form
// schemas and `src/server/auth.ts` both read them from here. Two copies of
// these numbers would agree only until one of them changed.
export const MAX_USER_NAME_LENGTH = 80;
export const MAX_EMAIL_LENGTH = 254;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
