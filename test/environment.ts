import * as z from "zod";

// One environment for every suite that touches the database: the end-to-end
// tests and the `db` Vitest project load the same files and pass the same
// check, so neither can reach a database the other would refuse.
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

const testEnvironmentSchema = z.object({
  DATABASE_URL: testDatabaseUrlSchema,
  DATABASE_URL_UNPOOLED: testDatabaseUrlSchema,
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.literal(E2E_BASE_URL),
  FEEDBACK_BOARD_ENV: z.literal("test"),
});

export function parseTestEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
) {
  const parsed = testEnvironmentSchema.safeParse(environment);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid test environment:\n${issues}`);
  }

  return parsed.data;
}
