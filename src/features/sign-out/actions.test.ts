import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/server/auth", () => ({
  auth: {
    api: {
      signOut: mocks.signOut,
    },
  },
}));

import { requestHeaders } from "@/server/action.testing";

import { signOutAction } from "./actions";

describe("signOutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.signOut.mockResolvedValue({ success: true });
  });

  it("signs out the current request", async () => {
    await expect(signOutAction()).resolves.toBeUndefined();

    expect(mocks.headers).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.signOut).toHaveBeenCalledExactlyOnceWith({
      headers: requestHeaders,
    });
  });

  it("rethrows an unexpected sign-out failure", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.signOut.mockRejectedValueOnce(unexpectedError);

    await expect(signOutAction()).rejects.toBe(unexpectedError);
  });
});
