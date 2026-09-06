import * as z from "zod";

const emailSchema = z
  .string({ error: "Enter a complete email address" })
  .trim()
  .pipe(
    z
      .email({ error: "Enter a complete email address" })
      .max(254, { error: "Use at most 254 characters" }),
  );

const nameSchema = z
  .string({ error: "Enter your name" })
  .trim()
  .min(1, { error: "Enter your name" })
  .max(80, { error: "Use at most 80 characters" });

const passwordSchema = z
  .string({ error: "Enter your password" })
  .min(8, { error: "Use at least 8 characters" })
  .max(128, { error: "Use at most 128 characters" });

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;

export const createAccountSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const authIntentSchema = z.enum(["vote", "feedback", "board"]);
export const authReturnToSchema = z.string();

export type AuthIntent = z.infer<typeof authIntentSchema>;

export const authModeSchema = z.enum(["sign-in", "create-account"]);
export type AuthMode = z.infer<typeof authModeSchema>;
