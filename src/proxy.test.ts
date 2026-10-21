import {
  getRedirectUrl,
  // The proxy guide calls this `unstable_doesProxyMatch`; Next.js 16.3.1
  // exports it only under its middleware name.
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/env", () => ({
  env: {
    BETTER_AUTH_URL: "https://feedback.example",
  },
  appOrigin: "https://feedback.example",
}));

import { config, proxy } from "./proxy";

const origin = "https://feedback.example";
const sessionCookie = "better-auth.session_token=token.signature";
const validSession = {
  session: { id: "session-id" },
  user: { id: "user-id" },
};

const fetchSession = vi.fn<typeof fetch>();
vi.stubGlobal("fetch", fetchSession);

function request(
  path: string,
  init: { cookie?: string | undefined; method?: string },
) {
  const headers = new Headers();
  if (init.cookie) headers.set("cookie", init.cookie);

  return new NextRequest(new URL(path, origin), {
    headers,
    method: init.method ?? "GET",
  });
}

function signInWith(query: Record<string, string | string[]>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of [value].flat()) searchParams.append(key, item);
  }

  return `/sign-in?${searchParams}`;
}

describe("proxy matcher", () => {
  it.each([
    "/dashboard",
    "/dashboard/settings",
    "/sign-in",
    signInWith({ mode: "create-account" }),
  ])("runs on %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each(["/", "/p/orbit-cli", "/api/auth/get-session"])(
    "does not run on %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    },
  );
});

describe("proxy", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("on the dashboard", () => {
    it("sends a guest to sign in with the path and query as returnTo", async () => {
      const response = await proxy(request("/dashboard?tab=planned", {}));

      expect(getRedirectUrl(response)).toBe(
        `${origin}/sign-in?returnTo=%2Fdashboard%3Ftab%3Dplanned`,
      );
    });

    it("lets a request with a session cookie through without asking for the session", async () => {
      const response = await proxy(
        request("/dashboard", { cookie: sessionCookie }),
      );

      expect(getRedirectUrl(response)).toBeNull();
      expect(fetchSession).not.toHaveBeenCalled();
    });
  });

  describe("on sign-in", () => {
    it("lets a guest through without asking for the session", async () => {
      const response = await proxy(
        request("/sign-in", { cookie: "theme=dark" }),
      );

      expect(getRedirectUrl(response)).toBeNull();
      expect(fetchSession).not.toHaveBeenCalled();
    });

    it("asks Better Auth for the session with the request's cookies", async () => {
      const cookie = `theme=dark; ${sessionCookie}`;
      fetchSession.mockResolvedValueOnce(Response.json(null));

      await proxy(request("/sign-in", { cookie }));

      expect(fetchSession).toHaveBeenCalledExactlyOnceWith(
        new URL(`${origin}/api/auth/get-session`),
        { headers: { cookie }, cache: "no-store" },
      );
    });

    it.each(["/sign-in", signInWith({ mode: "create-account" })])(
      "sends a signed-in visitor from %s to the dashboard",
      async (path) => {
        fetchSession.mockResolvedValueOnce(Response.json(validSession));

        const response = await proxy(request(path, { cookie: sessionCookie }));

        expect(getRedirectUrl(response)).toBe(`${origin}/dashboard`);
      },
    );

    it("sends a signed-in visitor to returnTo", async () => {
      fetchSession.mockResolvedValueOnce(Response.json(validSession));

      const response = await proxy(
        request(
          signInWith({
            returnTo: "/p/orbit-cli?sort=top#vote",
            intent: "vote",
          }),
          { cookie: sessionCookie },
        ),
      );

      expect(getRedirectUrl(response)).toBe(
        `${origin}/p/orbit-cli?sort=top#vote`,
      );
    });

    // The page receives a repeated parameter as an array, which
    // `parseReturnTo` rejects, so the proxy must not pick one of the values.
    it.each([
      ["an external", { returnTo: "//evil.com" }],
      ["a repeated", { returnTo: ["/p/orbit-cli", "/p/other"] }],
    ])(
      "sends a signed-in visitor with %s returnTo to the dashboard",
      async (_, query) => {
        fetchSession.mockResolvedValueOnce(Response.json(validSession));

        const response = await proxy(
          request(signInWith(query), { cookie: sessionCookie }),
        );

        expect(getRedirectUrl(response)).toBe(`${origin}/dashboard`);
      },
    );

    it("passes on a cookie the lookup refreshed", async () => {
      const refreshed = "better-auth.session_token=token.renewed; Path=/";
      fetchSession.mockResolvedValueOnce(
        Response.json(validSession, { headers: { "set-cookie": refreshed } }),
      );

      const response = await proxy(
        request("/sign-in", { cookie: sessionCookie }),
      );

      expect(getRedirectUrl(response)).toBe(`${origin}/dashboard`);
      expect(response.headers.getSetCookie()).toEqual([refreshed]);
    });

    it("shows the form to a cookie whose session has ended, and expires it", async () => {
      const expired = "better-auth.session_token=; Max-Age=0; Path=/";
      fetchSession.mockResolvedValueOnce(
        Response.json(null, { headers: { "set-cookie": expired } }),
      );

      const response = await proxy(
        request("/sign-in?returnTo=%2Fdashboard", { cookie: sessionCookie }),
      );

      expect(getRedirectUrl(response)).toBeNull();
      expect(response.headers.getSetCookie()).toEqual([expired]);
    });

    it("shows the form when the lookup fails", async () => {
      fetchSession.mockResolvedValueOnce(
        Response.json({ message: "Internal Server Error" }, { status: 500 }),
      );

      const response = await proxy(
        request("/sign-in", { cookie: sessionCookie }),
      );

      expect(getRedirectUrl(response)).toBeNull();
    });
  });

  it.each([
    ["a guest's dashboard action", "/dashboard", undefined],
    ["a signed-in visitor's sign-in action", "/sign-in", sessionCookie],
  ])("lets %s through", async (_, path, cookie) => {
    const response = await proxy(request(path, { cookie, method: "POST" }));

    expect(getRedirectUrl(response)).toBeNull();
    expect(fetchSession).not.toHaveBeenCalled();
  });
});
