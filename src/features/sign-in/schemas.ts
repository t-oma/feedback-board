import * as z from "zod";

import { currentPasswordSchema, emailSchema } from "@/entities/user/schemas";

export const signInSchema = z.object({
  email: emailSchema,
  password: currentPasswordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
