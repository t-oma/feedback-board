import { describe, expect, it } from "vitest";

import { parseReturnTo } from "@/entities/user/navigation";

import { getAuthBackTarget } from "./auth-back-target";

const origin = "https://feedback.example";

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
