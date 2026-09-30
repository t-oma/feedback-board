import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const HEX_COLOR_REGEX = /^#[\da-f]{6}$/i;

// Relative luminance and contrast ratio as WCAG 2.2 defines them:
// https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html#key-terms
const MIN_TEXT_CONTRAST = 4.5;

// How bright each channel looks to the eye; green counts the most.
const LUMINANCE_WEIGHTS = {
  red: 0.2126,
  green: 0.7152,
  blue: 0.0722,
} as const;

// Light reflected off the screen, added to both luminances. It is why the
// ratio runs from 1:1 to 21:1 instead of reaching infinity on black.
const VIEWING_FLARE = 0.05;

const stylesheet = readFileSync(
  new URL("./globals.css", import.meta.url),
  "utf8",
);

const colors = new Map<string, string>();

for (const match of stylesheet.matchAll(
  /--color-(?<name>[\w-]+):\s*(?<value>[^;]+);/g,
)) {
  const name = match.groups?.name;
  const value = match.groups?.value;

  if (name && value) colors.set(name, value.trim());
}

// A colour is text unless it is listed here. List fills, borders, and
// disabled text, which WCAG 1.4.3 exempts.
const nonTextColors = new Set([
  "foreground-disabled",
  "accent-muted",
  "border",
  "border-subtle",
  "danger-border",
]);

function isSurface(name: string) {
  return (
    name === "background" ||
    name === "surface" ||
    name.startsWith("surface-") ||
    name.endsWith("-surface")
  );
}

const surfaces = [...colors].filter(([name]) => isSurface(name));

const textColors = [...colors].filter(
  ([name]) => !isSurface(name) && !nonTextColors.has(name),
);

// A hex channel stores brightness on the sRGB curve, not linearly. This undoes
// the curve: a straight line near black, a 2.4 power above it. The numbers
// come from the sRGB standard, and WCAG quotes them unchanged.
function srgbChannelToLinear(channel: number) {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: string) {
  const red = Number.parseInt(color.slice(1, 3), 16) / 255;
  const green = Number.parseInt(color.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255;

  return (
    LUMINANCE_WEIGHTS.red * srgbChannelToLinear(red) +
    LUMINANCE_WEIGHTS.green * srgbChannelToLinear(green) +
    LUMINANCE_WEIGHTS.blue * srgbChannelToLinear(blue)
  );
}

function contrastRatio(first: string, second: string) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + VIEWING_FLARE) / (darker + VIEWING_FLARE);
}

describe("theme text contrast", () => {
  it("keeps every non-text color exclusion current", () => {
    const missingColors = [...nonTextColors].filter(
      (name) => !colors.has(name),
    );

    expect(
      missingColors,
      "non-text exceptions missing from globals.css",
    ).toEqual([]);
  });

  it("keeps every normal text color at AA contrast on every surface", () => {
    expect(textColors.length, "normal text colors").toBeGreaterThan(0);
    expect(surfaces.length, "surface colors").toBeGreaterThan(0);

    for (const [name, value] of [...textColors, ...surfaces]) {
      expect(value, `--color-${name}`).toMatch(HEX_COLOR_REGEX);
    }

    for (const [textName, textValue] of textColors) {
      for (const [surfaceName, surfaceValue] of surfaces) {
        const ratio = contrastRatio(textValue, surfaceValue);

        expect
          .soft(
            ratio,
            `--color-${textName} on --color-${surfaceName}: ${ratio.toFixed(2)}:1 (not text? add it to nonTextColors)`,
          )
          .toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      }
    }
  });
});
