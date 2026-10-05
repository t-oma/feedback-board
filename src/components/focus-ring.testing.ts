import { expect, userEvent } from "storybook/test";

type FocusRingPlacement = "outside" | "inside";

// Bounded so that an element which can never take focus fails the assertion
// below instead of hanging the story.
const MAX_TAB_PRESSES = 10;

// Presses Tab until `element` has focus. How many stops come first can depend
// on the viewport: the `AuthHeader` home link only exists from `md` up.
export async function tabTo(element: Element) {
  for (
    let presses = 0;
    presses < MAX_TAB_PRESSES && document.activeElement !== element;
    presses++
  ) {
    await userEvent.tab();
  }

  await expect(element).toHaveFocus();
}

// The colour is read from the theme rather than written here, so this checks
// the token whose contrast `src/app/theme-contrast.test.ts` enforces. The style
// is read as soon as focus lands, so a transition on `outline-color` fails the
// check, as it should: the ring would first appear in another colour.
export async function expectFocusRing(
  element: Element,
  placement: FocusRingPlacement,
) {
  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-accent")
    .trim();

  await expect(element).toHaveFocus();
  await expect(element).toHaveStyle({
    outlineStyle: "solid",
    outlineWidth: "2px",
    outlineColor: accent,
    outlineOffset: placement === "outside" ? "2px" : "-2px",
  });
}
