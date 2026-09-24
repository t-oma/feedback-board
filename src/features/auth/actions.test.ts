import { BASE_ERROR_CODES } from "better-auth";
import { APIError } from "better-auth/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  redirect: vi.fn(),
  signInEmail: vi.fn(),
  signOut: vi.fn(),
  signUpEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/server/auth", () => ({
  auth: {
    api: {
      signInEmail: mocks.signInEmail,
      signOut: mocks.signOut,
      signUpEmail: mocks.signUpEmail,
    },
  },
}));

vi.mock("@/server/env", () => ({
  env: {
    BETTER_AUTH_URL: "https://feedback.example",
  },
}));

import { createAccountAction, signInAction, signOutAction } from "./actions";

const redirectSignal = new Error("NEXT_REDIRECT");
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

    await expect(signInAction(null, formData)).resolves.toEqual({
      ok: false,
      code: "VALIDATION",
      message: "Check the highlighted fields",
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

    await expect(signInAction(null, formData)).resolves.toEqual({
      ok: false,
      code: "UNAUTHENTICATED",
      message: "That email and password do not match an account.",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("rethrows unexpected sign-in errors", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signInEmail.mockRejectedValueOnce(unexpectedError);
    const formData = new FormData();
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");

    await expect(signInAction(null, formData)).rejects.toBe(unexpectedError);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
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

    await expect(createAccountAction(null, formData)).resolves.toEqual({
      ok: false,
      code: "VALIDATION",
      message: "Check the highlighted fields",
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

    await expect(createAccountAction(null, formData)).resolves.toEqual({
      ok: false,
      code: "CONFLICT",
      message: "An account already uses this email.",
      fieldErrors: {
        email: ["An account already uses this email."],
      },
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("rethrows unexpected account-creation errors", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signUpEmail.mockRejectedValueOnce(unexpectedError);
    const formData = new FormData();
    formData.set("name", "Ada Lovelace");
    formData.set("email", "ada@example.com");
    formData.set("password", "pass word");

    await expect(createAccountAction(null, formData)).rejects.toBe(
      unexpectedError,
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe("signOutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.signOut.mockResolvedValue({ success: true });
    mocks.redirect.mockImplementation(() => {
      throw redirectSignal;
    });
  });

  it("signs out the current request and redirects home", async () => {
    await expect(signOutAction()).rejects.toBe(redirectSignal);

    expect(mocks.headers).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.signOut).toHaveBeenCalledExactlyOnceWith({
      headers: requestHeaders,
    });
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/");
  });

  it("rethrows an unexpected sign-out failure without redirecting", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signOut.mockRejectedValueOnce(unexpectedError);

    await expect(signOutAction()).rejects.toBe(unexpectedError);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
