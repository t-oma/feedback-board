import { describe, expect, it } from "vitest";

import { feedbackHref } from "./feedback-href";

describe("feedbackHref", () => {
  it("leads to the item under its board's address", () => {
    expect(
      feedbackHref("orbit-cli", "019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7b"),
    ).toBe("/p/orbit-cli/feedback/019a1b2c-3d4e-7f80-9a1b-2c3d4e5f6a7b");
  });
});
