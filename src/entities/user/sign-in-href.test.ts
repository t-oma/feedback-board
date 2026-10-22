import { describe, expect, it } from "vitest";

import { buildSignInHref } from "./sign-in-href";

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
