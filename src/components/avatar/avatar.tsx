import { getInitials } from "./get-initials";

type AvatarProps = {
  name: string;
};

// Hidden from assistive technology: the control that holds the avatar carries
// the name, and two letters read aloud would say nothing more.
export function Avatar({ name }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-full bg-border-subtle text-xs font-medium text-foreground-secondary select-none"
    >
      {getInitials(name)}
    </span>
  );
}

// The 48-pixel box of the control that holds an avatar, with the circle
// inside, so that the control replaces it without moving.
export function AvatarSkeleton() {
  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 place-items-center"
    >
      <span className="size-8 rounded-full bg-surface-muted" />
    </span>
  );
}
