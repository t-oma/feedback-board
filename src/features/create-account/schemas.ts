import * as z from "zod";

import {
  emailSchema,
  newPasswordSchema,
  userNameSchema,
} from "@/entities/user/schemas";

export const createAccountSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: newPasswordSchema,
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
