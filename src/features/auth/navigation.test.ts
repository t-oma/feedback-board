import { describe, expect, it } from "vitest";

import { buildSignInHref, parseAuthNavigation } from "./navigation";

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

describe("parseAuthNavigation", () => {
  it.each([
    ["/", "/"],
    ["/dashboard", "/dashboard"],
    ["/p/orbit-cli?sort=top#vote", "/p/orbit-cli?sort=top#vote"],
    ["/%2F%2Fevil.com", "/%2F%2Fevil.com"],
  ])("accepts the internal target %s", (returnTo, expected) => {
    expect(
      parseAuthNavigation({ returnTo, origin, fallback: "/fallback" }),
    ).toMatchObject({
      returnTo: expected,
      hasExplicitReturnTo: true,
    });
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
  ])("replaces unsafe target %j with the caller fallback", (returnTo) => {
    expect(
      parseAuthNavigation({ returnTo, origin, fallback: "/fallback" }),
    ).toMatchObject({
      returnTo: "/fallback",
      hasExplicitReturnTo: false,
    });
  });

  it.each([
    ["vote", "Sign in to vote."],
    ["feedback", "Sign in to add feedback."],
    ["board", "Sign in to create your board."],
  ])("maps intent %s to presentation copy", (intent, supportingText) => {
    expect(
      parseAuthNavigation({ intent, origin, fallback: "/" }),
    ).toMatchObject({ intent, supportingText });
  });

  it.each([undefined, "", "admin", ["vote"]])(
    "ignores unknown intent %j",
    (intent) => {
      expect(
        parseAuthNavigation({ intent, origin, fallback: "/" }),
      ).toMatchObject({ intent: null, supportingText: null });
    },
  );

  it("never lets intent change the redirect target", () => {
    const targets = ["vote", "feedback", "board"].map(
      (intent) =>
        parseAuthNavigation({
          returnTo: "/p/orbit-cli",
          intent,
          origin,
          fallback: "/",
        }).returnTo,
    );

    expect(targets).toEqual(["/p/orbit-cli", "/p/orbit-cli", "/p/orbit-cli"]);
  });

  it.each([
    ["sign-in", "sign-in"],
    ["create-account", "create-account"],
    [undefined, "sign-in"],
    ["", "sign-in"],
    ["admin", "sign-in"],
    [["create-account"], "sign-in"],
  ])("parses auth mode %j as %s", (mode, expected) => {
    expect(
      parseAuthNavigation({
        mode,
        origin,
        fallback: "/",
      }),
    ).toMatchObject({ mode: expected });
  });

  it("parses all navigation parameters together", () => {
    const returnTo = "/p/orbit-cli?sort=top#vote";

    expect(
      parseAuthNavigation({
        returnTo,
        intent: "feedback",
        mode: "create-account",
        origin,
        fallback: "/",
      }),
    ).toEqual({
      returnTo,
      hasExplicitReturnTo: true,
      intent: "feedback",
      mode: "create-account",
      supportingText: "Sign in to add feedback.",
    });
  });
});
