import { skeletonToneClassName } from "../skeleton";
import { buttonShapeClassName } from "./variants";

export function ButtonSkeleton() {
  return (
    <div
      data-skeleton-control
      className={`${buttonShapeClassName} ${skeletonToneClassName}`}
    />
  );
}
