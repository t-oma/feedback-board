import * as z from "zod";

import {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_USER_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "./contracts";

const emailSchema = z
  .string({ error: "Enter a complete email address" })
  .trim()
  .pipe(
    z.email({ error: "Enter a complete email address" }).max(MAX_EMAIL_LENGTH, {
      error: `Use at most ${String(MAX_EMAIL_LENGTH)} characters`,
    }),
  );

const nameSchema = z
  .string({ error: "Enter your name" })
  .trim()
  .min(1, { error: "Enter your name" })
  .max(MAX_USER_NAME_LENGTH, {
    error: `Use at most ${String(MAX_USER_NAME_LENGTH)} characters`,
  });

const passwordMaxMessage = `Use at most ${String(MAX_PASSWORD_LENGTH)} characters`;

// Sign-up enforces the policy. Sign-in only asks for a password: one set
// under an older, weaker policy must still get its owner in. Both keep the
// upper bound, which stops oversized input before it reaches the hash.
const newPasswordSchema = z
  .string({ error: "Enter your password" })
  .min(MIN_PASSWORD_LENGTH, {
    error: `Use at least ${String(MIN_PASSWORD_LENGTH)} characters`,
  })
  .max(MAX_PASSWORD_LENGTH, { error: passwordMaxMessage });

const currentPasswordSchema = z
  .string({ error: "Enter your password" })
  .min(1, { error: "Enter your password" })
  .max(MAX_PASSWORD_LENGTH, { error: passwordMaxMessage });

export const signInSchema = z.object({
  email: emailSchema,
  password: currentPasswordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;

export const createAccountSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: newPasswordSchema,
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const authIntentSchema = z.enum(["vote", "feedback", "board"]);
export const authReturnToSchema = z.string();

export type AuthIntent = z.infer<typeof authIntentSchema>;

export const authModeSchema = z.enum(["sign-in", "create-account"]);
export type AuthMode = z.infer<typeof authModeSchema>;
