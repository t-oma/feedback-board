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

import {
  formDataOf,
  realRedirectError,
  requestHeaders,
  unexpectedActionError,
} from "@/server/action.testing";

import { signInAction } from "./actions";

const redirectSignal = new Error("NEXT_REDIRECT");

const consoleError = vi
  .spyOn(console, "error")
  .mockImplementation(() => undefined);

const credentials = { email: "ada@example.com", password: "pass word" };

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
    const formData = formDataOf({ email: "ada@invalid", password: "" });

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
    const password = "  pass word  ";
    const formData = formDataOf({
      email: "  Ada@example.com  ",
      password,
      returnTo: "/p/orbit-cli?sort=top#vote",
    });

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
    const formData = formDataOf({
      ...credentials,
      returnTo: "https://evil.example/phishing",
    });

    await expect(signInAction(null, formData)).rejects.toBe(redirectSignal);

    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/");
  });

  it("returns a generic error when the credentials are invalid", async () => {
    mocks.signInEmail.mockRejectedValueOnce(
      new APIError("UNAUTHORIZED", BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD),
    );

    await expect(
      signInAction(null, formDataOf(credentials)),
    ).resolves.toStrictEqual({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "That email and password do not match an account.",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("logs an unexpected sign-in error and returns it as UNEXPECTED", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signInEmail.mockRejectedValueOnce(unexpectedError);

    await expect(
      signInAction(null, formDataOf(credentials)),
    ).resolves.toStrictEqual(unexpectedActionError);
    expect(consoleError).toHaveBeenCalledWith(
      expect.any(String),
      unexpectedError,
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("rethrows a Next.js redirect raised inside the sign-in call", async () => {
    const redirectError = await realRedirectError();
    mocks.signInEmail.mockRejectedValueOnce(redirectError);

    await expect(signInAction(null, formDataOf(credentials))).rejects.toBe(
      redirectError,
    );
    expect(consoleError).not.toHaveBeenCalled();
  });
});
