import { afterEach, describe, expect, it, vi } from "vitest";

import { getInitials } from "./get-initials";

describe("getInitials", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["Artem Levchenko", "AL"],
    ["artem levchenko", "AL"],
    ["Artem", "A"],
    ["  Marta   Kowal  ", "MK"],
    ["Anna Maria Kowalska", "AK"],
    ["Émile Zola", "ÉZ"],
    ["😀 Smile", "😀S"],
  ])("takes %j as %j", (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });

  it("keeps a letter and its combining mark together", () => {
    expect(getInitials("émile zola")).toBe("ÉZ");
  });

  it("keeps an emoji joined from several together", () => {
    expect(getInitials("👩‍💻 Dev")).toBe("👩‍💻D");
  });

  it("falls back to the first character where Intl.Segmenter is missing", () => {
    vi.stubGlobal(
      "Intl",
      Object.create(Intl, { Segmenter: { value: undefined } }),
    );

    expect(getInitials("émile zola")).toBe("ÉZ");
    expect(getInitials("😀 Smile")).toBe("😀S");
  });
});
