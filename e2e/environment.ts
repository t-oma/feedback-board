import * as z from "zod";

export const E2E_BASE_URL = "http://127.0.0.1:3100";

function pointsToTestDatabase(value: string) {
  try {
    return (
      decodeURIComponent(new URL(value).pathname) === "/feedback_board_test"
    );
  } catch {
    return false;
  }
}

const testDatabaseUrlSchema = z
  .url({ protocol: /^postgres(ql)?$/ })
  .refine(pointsToTestDatabase, {
    error: "Database URL must point to feedback_board_test",
  });

const e2eEnvironmentSchema = z.object({
  DATABASE_URL: testDatabaseUrlSchema,
  DATABASE_URL_UNPOOLED: testDatabaseUrlSchema,
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.literal(E2E_BASE_URL),
  FEEDBACK_BOARD_ENV: z.literal("test"),
});

export function parseE2EEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
) {
  const parsed = e2eEnvironmentSchema.safeParse(environment);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid E2E environment:\n${issues}`);
  }

  return parsed.data;
}
