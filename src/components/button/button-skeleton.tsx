import { buttonStyles } from "./styles";

export function ButtonSkeleton() {
  return (
    <div data-skeleton-control className={buttonStyles({ skeleton: true })} />
  );
}
