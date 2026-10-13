import { BASE_ERROR_CODES } from "better-auth";
import { APIError } from "better-auth/api";
import type * as Navigation from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  redirect: vi.fn(),
  signUpEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

// `unstable_rethrow` stays real, so the tests exercise how the action treats
// an error Next.js throws on purpose.
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof Navigation>()),
  redirect: mocks.redirect,
}));

vi.mock("server-only", () => ({}));

vi.mock("@/server/auth", () => ({
  auth: {
    api: {
      signUpEmail: mocks.signUpEmail,
    },
  },
}));

vi.mock("@/server/env", () => ({
  env: {
    BETTER_AUTH_URL: "https://feedback.example",
  },
}));

import { createAccountAction } from "./actions";

const redirectSignal = new Error("NEXT_REDIRECT");

const navigation = await vi.importActual<typeof Navigation>("next/navigation");

function thrownBy(run: () => unknown) {
  try {
    run();
  } catch (error) {
    return error;
  }

  throw new Error("Expected the call to throw");
}

// A real redirect error, which `unstable_rethrow` recognises by its digest.
const nextRedirectError = thrownBy(() => navigation.redirect("/dashboard"));

const unexpectedActionError = {
  ok: false,
  code: "UNEXPECTED",
  message: "We couldn’t complete your request. Please try again.",
};

const consoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => undefined);

const requestHeaders = new Headers({
  cookie: "session=test",
  "user-agent": "Vitest",
  "x-forwarded-for": "203.0.113.7",
});

describe("createAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.signUpEmail.mockResolvedValue(undefined);
    mocks.redirect.mockImplementation(() => {
      throw redirectSignal;
    });
  });

  it("returns field errors without calling Better Auth when input is invalid", async () => {
    const formData = new FormData();
    formData.set("name", "   ");
    formData.set("email", "ada@invalid");
    formData.set("password", "short");

    await expect(createAccountAction(null, formData)).resolves.toStrictEqual({
      ok: false,
      code: "VALIDATION",
      fieldErrors: {
        name: ["Enter your name"],
        email: ["Enter a complete email address"],
        password: ["Use at least 8 characters"],
      },
    });
    expect(mocks.signUpEmail).not.toHaveBeenCalled();
  });

  it("creates an account with normalized input and redirects to a valid return target", async () => {
    const formData = new FormData();
    const password = "  pass word  ";
    formData.set("name", "  Ada Lovelace  ");
    formData.set("email", "  ada@example.com  ");
    formData.set("password", password);
    formData.set("returnTo", "/p/orbit-cli#comments");

    await expect(createAccountAction(null, formData)).rejects.toBe(
      redirectSignal,
    );

    expect(mocks.signUpEmail).toHaveBeenCalledExactlyOnceWith({
      body: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password,
      },
      headers: requestHeaders,
    });
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith(
      "/p/orbit-cli#comments",
    );
  });

  it("falls back to the dashboard when the return target is unsafe", async () => {
    const formData = new FormData();
    formData.set("name", "Ada Lovelace");
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");
    formData.set("returnTo", "//evil.example/phishing");

    await expect(createAccountAction(null, formData)).rejects.toBe(
      redirectSignal,
    );

    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/dashboard");
  });

  it("returns an email conflict when the account already exists", async () => {
    mocks.signUpEmail.mockRejectedValueOnce(
      new APIError(
        "UNPROCESSABLE_ENTITY",
        BASE_ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL,
      ),
    );
    const formData = new FormData();
    formData.set("name", "Ada Lovelace");
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");

    await expect(createAccountAction(null, formData)).resolves.toStrictEqual({
      ok: false,
      code: "CONFLICT",
      fieldErrors: {
        email: ["An account already uses this email."],
      },
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("logs an unexpected account-creation error and returns it as UNEXPECTED", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signUpEmail.mockRejectedValueOnce(unexpectedError);
    const formData = new FormData();
    formData.set("name", "Ada Lovelace");
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");

    await expect(createAccountAction(null, formData)).resolves.toStrictEqual(
      unexpectedActionError,
    );
    expect(consoleError).toHaveBeenCalledWith(
      expect.any(String),
      unexpectedError,
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("rethrows a Next.js redirect raised inside the sign-up call", async () => {
    mocks.signUpEmail.mockRejectedValueOnce(nextRedirectError);
    const formData = new FormData();
    formData.set("name", "Ada Lovelace");
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");

    await expect(createAccountAction(null, formData)).rejects.toBe(
      nextRedirectError,
    );
    expect(consoleError).not.toHaveBeenCalled();
  });
});
