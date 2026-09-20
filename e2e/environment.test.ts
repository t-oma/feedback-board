import { describe, expect, it } from "vitest";

import { E2E_BASE_URL, parseE2EEnvironment } from "./environment";

const validEnvironment = {
  DATABASE_URL:
    "postgresql://feedback:password@127.0.0.1:5432/feedback_board_test",
  DATABASE_URL_UNPOOLED:
    "postgresql://feedback:password@127.0.0.1:5432/feedback_board_test",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: E2E_BASE_URL,
  FEEDBACK_BOARD_ENV: "test",
} satisfies Record<string, string>;

describe("parseE2EEnvironment", () => {
  it("returns an explicitly configured test environment", () => {
    expect(parseE2EEnvironment(validEnvironment)).toEqual(validEnvironment);
  });

  it.each(["DATABASE_URL", "DATABASE_URL_UNPOOLED"] as const)(
    "rejects a non-test %s",
    (key) => {
      expect(() =>
        parseE2EEnvironment({
          ...validEnvironment,
          [key]: "postgresql://feedback:password@127.0.0.1:5432/feedback_board",
        }),
      ).toThrow(`${key}: Database URL must point to feedback_board_test`);
    },
  );

  it("rejects a non-test application environment", () => {
    expect(() =>
      parseE2EEnvironment({
        ...validEnvironment,
        FEEDBACK_BOARD_ENV: "dev",
      }),
    ).toThrow("FEEDBACK_BOARD_ENV");
  });

  it("rejects an auth URL that does not match the isolated web server", () => {
    expect(() =>
      parseE2EEnvironment({
        ...validEnvironment,
        BETTER_AUTH_URL: "http://localhost:3000",
      }),
    ).toThrow("BETTER_AUTH_URL");
  });
});
