import { BASE_ERROR_CODES } from "better-auth";
import { APIError } from "better-auth/api";
import type * as Navigation from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  redirect: vi.fn(),
  signInEmail: vi.fn(),
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
      signInEmail: mocks.signInEmail,
    },
  },
}));

vi.mock("@/server/env", () => ({
  env: {
    BETTER_AUTH_URL: "https://feedback.example",
  },
}));

import { signInAction } from "./actions";

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

describe("signInAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.signInEmail.mockResolvedValue(undefined);
    mocks.redirect.mockImplementation(() => {
      throw redirectSignal;
    });
  });

  it("returns field errors without calling Better Auth when input is invalid", async () => {
    const formData = new FormData();
    formData.set("email", "ada@invalid");
    formData.set("password", "");

    await expect(signInAction(null, formData)).resolves.toStrictEqual({
      ok: false,
      code: "VALIDATION",
      fieldErrors: {
        email: ["Enter a complete email address"],
        password: ["Enter your password"],
      },
    });
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });

  it("signs in with normalized input and redirects to a valid return target", async () => {
    const formData = new FormData();
    const password = "  pass word  ";
    formData.set("email", "  Ada@example.com  ");
    formData.set("password", password);
    formData.set("returnTo", "/p/orbit-cli?sort=top#vote");

    await expect(signInAction(null, formData)).rejects.toBe(redirectSignal);

    expect(mocks.signInEmail).toHaveBeenCalledExactlyOnceWith({
      body: {
        email: "Ada@example.com",
        password,
      },
      headers: requestHeaders,
    });
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith(
      "/p/orbit-cli?sort=top#vote",
    );
  });

  it("falls back to the home page when the return target is unsafe", async () => {
    const formData = new FormData();
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");
    formData.set("returnTo", "https://evil.example/phishing");

    await expect(signInAction(null, formData)).rejects.toBe(redirectSignal);

    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/");
  });

  it("returns a generic error when the credentials are invalid", async () => {
    mocks.signInEmail.mockRejectedValueOnce(
      new APIError("UNAUTHORIZED", BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD),
    );
    const formData = new FormData();
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");

    await expect(signInAction(null, formData)).resolves.toStrictEqual({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "That email and password do not match an account.",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("logs an unexpected sign-in error and returns it as UNEXPECTED", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signInEmail.mockRejectedValueOnce(unexpectedError);
    const formData = new FormData();
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");

    await expect(signInAction(null, formData)).resolves.toStrictEqual(
      unexpectedActionError,
    );
    expect(consoleError).toHaveBeenCalledWith(
      expect.any(String),
      unexpectedError,
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("rethrows a Next.js redirect raised inside the sign-in call", async () => {
    mocks.signInEmail.mockRejectedValueOnce(nextRedirectError);
    const formData = new FormData();
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");

    await expect(signInAction(null, formData)).rejects.toBe(nextRedirectError);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
