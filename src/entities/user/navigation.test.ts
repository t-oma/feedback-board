import { describe, expect, it } from "vitest";

import { buildSignInHref, parseReturnTo, parseSignInQuery } from "./navigation";

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
