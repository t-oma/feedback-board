import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("react", () => ({
  cache: <Value>(value: Value) => value,
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
      getSession: mocks.getSession,
    },
  },
}));

import { requireSession } from "./session.server";

const redirectSignal = new Error("NEXT_REDIRECT");
const requestHeaders = new Headers({ cookie: "session=test" });
const validSession = {
  session: { id: "session-id" },
  user: { id: "user-id" },
};

describe("auth session boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.headers.mockResolvedValue(requestHeaders);
    mocks.redirect.mockImplementation(() => {
      throw redirectSignal;
    });
  });

  it("reads and returns the current Better Auth session", async () => {
    mocks.getSession.mockResolvedValueOnce(validSession);

    await expect(requireSession({ returnTo: "/dashboard" })).resolves.toBe(
      validSession,
    );
    expect(mocks.headers).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.getSession).toHaveBeenCalledExactlyOnceWith({
      headers: requestHeaders,
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects a missing session to sign in with returnTo", async () => {
    mocks.getSession.mockResolvedValueOnce(null);

    await expect(requireSession({ returnTo: "/dashboard" })).rejects.toBe(
      redirectSignal,
    );
    expect(mocks.redirect).toHaveBeenCalledExactlyOnceWith(
      "/sign-in?returnTo=%2Fdashboard",
    );
  });

  it("rethrows an unexpected session lookup failure", async () => {
    const unexpectedError = new Error("Database unavailable");
    mocks.getSession.mockRejectedValueOnce(unexpectedError);

    await expect(requireSession({ returnTo: "/dashboard" })).rejects.toBe(
      unexpectedError,
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
