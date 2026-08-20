import "server-only";

import * as z from "zod";

const postgresUrlSchema = z.url({ protocol: /^postgres(ql)?$/ });

const envSchema = z.object({
  DATABASE_URL: postgresUrlSchema,
  DATABASE_URL_UNPOOLED: postgresUrlSchema,
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }),
  FEEDBACK_BOARD_ENV: z.enum(["dev", "test", "prod"]),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;
