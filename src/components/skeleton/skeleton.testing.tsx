import type { ReactNode } from "react";
import { expect } from "storybook/test";

type SkeletonGeometryProps = {
  content: ReactNode;
  skeleton: ReactNode;
  // What each of them renders in on a page, such as its `main`.
  frame?: (children: ReactNode) => ReactNode;
};

// The content and its skeleton one under the other, at the same width. Side
// by side they would share the viewport's width and wrap differently from a
// page.
export function SkeletonGeometry({
  content,
  skeleton,
  frame = (children) => children,
}: SkeletonGeometryProps) {
  return (
    <div className="flex flex-col">
      <div data-skeleton-geometry="content" className="flex flex-col">
        {frame(content)}
      </div>
      <div data-skeleton-geometry="skeleton" className="flex flex-col">
        {frame(skeleton)}
      </div>
    </div>
  );
}

// What a person interacts with, and so notices moving. Hidden ones, such as
// the controls of an inactive tab panel, have no box and are skipped.
const controlSelector =
  'input:not([type="hidden"]), textarea, button[type="submit"], [role="tab"]';

function boxes(root: Element, selector: string) {
  const rootTop = root.getBoundingClientRect().top;
  return Array.from(root.querySelectorAll(selector))
    .filter((element) => element.getClientRects().length > 0)
    .map((element) => {
      const { top, height } = element.getBoundingClientRect();
      return { top: Math.round(top - rootTop), height: Math.round(height) };
    });
}

// Replacing the skeleton moves nothing: each control starts where the block
// marked `data-skeleton-control` for it starts and is as tall, and the two
// take the same height overall. Content without controls, such as an empty
// state, is compared on its height alone.
export async function expectSkeletonGeometry(canvasElement: HTMLElement) {
  const content = canvasElement.querySelector(
    '[data-skeleton-geometry="content"]',
  );
  const skeleton = canvasElement.querySelector(
    '[data-skeleton-geometry="skeleton"]',
  );
  if (content === null || skeleton === null) {
    throw new Error("Render the story through `SkeletonGeometry`.");
  }

  await expect(boxes(skeleton, "[data-skeleton-control]")).toEqual(
    boxes(content, controlSelector),
  );
  await expect(Math.round(skeleton.getBoundingClientRect().height)).toBe(
    Math.round(content.getBoundingClientRect().height),
  );
}
