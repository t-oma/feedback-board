import { describe, expect, it } from "vitest";

import {
  buildSignInHref,
  getAuthBackTarget,
  parseReturnTo,
  parseSignInQuery,
} from "./navigation";

const origin = "https://feedback.example";

describe("buildSignInHref", () => {
  it("returns the bare sign-in route when options are absent", () => {
    expect(buildSignInHref()).toBe("/sign-in");
  });

  it("encodes returnTo as one query parameter", () => {
    const returnTo = "/p/orbit-cli?sort=top#vote";
    const targetUrl = new URL(buildSignInHref({ returnTo }), origin);

    expect(targetUrl.pathname).toBe("/sign-in");
    expect([...targetUrl.searchParams]).toEqual([["returnTo", returnTo]]);
  });

  it("adds intent independently of returnTo", () => {
    expect(buildSignInHref({ intent: "vote" })).toBe("/sign-in?intent=vote");

    const returnTo = "/p/orbit-cli?sort=top&status=open#vote";
    const href = buildSignInHref({ returnTo, intent: "feedback" });
    const targetUrl = new URL(href, origin);

    expect(targetUrl.pathname).toBe("/sign-in");
    expect(targetUrl.searchParams.get("returnTo")).toBe(returnTo);
    expect(targetUrl.searchParams.get("intent")).toBe("feedback");
  });

  it("omits an empty returnTo", () => {
    expect(buildSignInHref({ returnTo: "" })).toBe("/sign-in");
  });

  it("adds mode correctly", () => {
    expect(buildSignInHref()).toBe("/sign-in");
    expect(buildSignInHref({ mode: "sign-in" })).toBe("/sign-in");
    expect(buildSignInHref({ mode: "create-account" })).toBe(
      "/sign-in?mode=create-account",
    );

    expect(buildSignInHref({ mode: undefined })).toBe("/sign-in");
  });

  it("combines all query parameters", () => {
    const returnTo = "/p/orbit-cli?sort=top&status=open#vote";
    const targetUrl = new URL(
      buildSignInHref({
        returnTo,
        intent: "feedback",
        mode: "create-account",
      }),
      origin,
    );

    expect(targetUrl.pathname).toBe("/sign-in");
    expect(targetUrl.searchParams.get("returnTo")).toBe(returnTo);
    expect(targetUrl.searchParams.get("intent")).toBe("feedback");
    expect(targetUrl.searchParams.get("mode")).toBe("create-account");
  });
});

describe("parseReturnTo", () => {
  it.each([
    ["/", "/"],
    ["/dashboard", "/dashboard"],
    ["/p/orbit-cli?sort=top#vote", "/p/orbit-cli?sort=top#vote"],
    ["/%2F%2Fevil.com", "/%2F%2Fevil.com"],
  ])("accepts the internal target %s", (returnTo, expected) => {
    expect(parseReturnTo(returnTo, origin)).toBe(expected);
  });

  it.each([
    undefined,
    "",
    ["/dashboard"],
    "//evil.com",
    String.raw`/\evil.com`,
    String.raw`\/evil.com`,
    "/\u0009/evil.com",
    " https://feedback.example/dashboard",
    "https://evil.com",
    "javascript:alert(1)",
    "/api",
    "/api/auth/get-session",
  ])("rejects the unsafe target %j", (returnTo) => {
    expect(parseReturnTo(returnTo, origin)).toBeNull();
  });
});

describe("parseSignInQuery", () => {
  it.each(["vote", "feedback", "board"])("keeps the intent %s", (intent) => {
    expect(parseSignInQuery({ intent }, origin)).toMatchObject({ intent });
  });

  it.each([undefined, "", "admin", ["vote"]])(
    "ignores unknown intent %j",
    (intent) => {
      expect(parseSignInQuery({ intent }, origin)).toMatchObject({
        intent: null,
      });
    },
  );

  it("never lets intent change the redirect target", () => {
    const targets = ["vote", "feedback", "board"].map(
      (intent) =>
        parseSignInQuery({ returnTo: "/p/orbit-cli", intent }, origin).returnTo,
    );

    expect(targets).toEqual(["/p/orbit-cli", "/p/orbit-cli", "/p/orbit-cli"]);
  });

  it("drops an unsafe returnTo instead of replacing it", () => {
    expect(parseSignInQuery({ returnTo: "//evil.com" }, origin)).toMatchObject({
      returnTo: null,
    });
  });

  it.each([
    ["sign-in", "sign-in"],
    ["create-account", "create-account"],
    [undefined, "sign-in"],
    ["", "sign-in"],
    ["admin", "sign-in"],
    [["create-account"], "sign-in"],
  ])("parses auth mode %j as %s", (mode, expected) => {
    expect(parseSignInQuery({ mode }, origin)).toMatchObject({
      mode: expected,
    });
  });

  it("parses all query parameters together", () => {
    const returnTo = "/p/orbit-cli?sort=top#vote";

    expect(
      parseSignInQuery(
        { returnTo, intent: "feedback", mode: "create-account" },
        origin,
      ),
    ).toEqual({ returnTo, intent: "feedback", mode: "create-account" });
  });
});

describe("getAuthBackTarget", () => {
  it.each([
    {
      returnTo: "/p/orbit-cli?sort=top#vote",
      expected: { kind: "board", slug: "orbit-cli" },
    },
    {
      returnTo: "/p/orbit-cli/",
      expected: { kind: "board", slug: "orbit-cli" },
    },
    {
      returnTo:
        "/p/orbit-cli/feedback/019a0000-0000-7000-8000-000000000001?from=board#vote",
      expected: { kind: "feedback" },
    },
    {
      returnTo: "/p/orbit-cli/feedback/019a0000-0000-7000-8000-000000000001/",
      expected: { kind: "feedback" },
    },
    {
      returnTo: "/p/orbit-cli/changelog?year=2026#latest",
      expected: { kind: "changelog" },
    },
    {
      returnTo: "/p/orbit-cli/changelog/",
      expected: { kind: "changelog" },
    },
  ])("returns to the public context $returnTo", ({ returnTo, expected }) => {
    expect(getAuthBackTarget(parseReturnTo(returnTo, origin))).toEqual({
      href: returnTo,
      ...expected,
    });
  });

  it.each([
    undefined,
    "",
    ["/p/orbit-cli"],
    "/",
    "/dashboard",
    "/dashboard/settings?tab=profile",
    "/sign-in?mode=create-account",
    "/unknown",
    "//evil.com",
    "https://evil.com/p/orbit-cli",
    "/api/auth",
    "/p",
    "/p/",
    "/p/orbit-cli/settings",
    "/p/orbit-cli/feedback",
    "/p/orbit-cli/feedback/id/edit",
    "/p/orbit-cli/changelog/private",
    "/p/-orbit-cli",
    "/p/orbit--cli",
    "/p/orbit-cli-",
    "/p/orbit%20cli",
  ])("exits to home for %j", (returnTo) => {
    expect(getAuthBackTarget(parseReturnTo(returnTo, origin))).toEqual({
      kind: "home",
      href: "/",
    });
  });
});
