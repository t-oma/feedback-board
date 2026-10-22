import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  redirect: vi.fn(),
  signOut: vi.fn(),
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
      signOut: mocks.signOut,
    },
  },
}));

vi.mock("@/server/env", () => ({
  appOrigin: "https://feedback.example",
}));

import { formDataOf, requestHeaders } from "@/server/action.testing";

import { signOutAction } from "./actions";

const redirectSignal = new Error("NEXT_REDIRECT");

describe("signOutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.signOut.mockResolvedValue({ success: true });
    mocks.redirect.mockImplementation(() => {
      throw redirectSignal;
    });
  });

  it("signs out the current request and returns to the page it was on", async () => {
    await expect(
      signOutAction(formDataOf({ returnTo: "/p/orbit-cli?sort=top" })),
    ).rejects.toBe(redirectSignal);

    expect(mocks.headers).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.signOut).toHaveBeenCalledExactlyOnceWith({
      headers: requestHeaders,
    });
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith(
      "/p/orbit-cli?sort=top",
    );
  });

  it("goes home without a page to return to", async () => {
    await expect(signOutAction(new FormData())).rejects.toBe(redirectSignal);

    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/");
  });

  it.each([
    "https://evil.example/p/orbit-cli",
    "//evil.example/p/orbit-cli",
    "/api/auth/get-session",
  ])("goes home rather than to %j", async (returnTo) => {
    await expect(signOutAction(formDataOf({ returnTo }))).rejects.toBe(
      redirectSignal,
    );

    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith("/");
  });

  it("rethrows an unexpected sign-out failure without redirecting", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signOut.mockRejectedValueOnce(unexpectedError);

    await expect(
      signOutAction(formDataOf({ returnTo: "/p/orbit-cli" })),
    ).rejects.toBe(unexpectedError);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
