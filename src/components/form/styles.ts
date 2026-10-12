import { tv } from "tailwind-variants";

// One column with the mobile designs' 18px between the banner, the fields and
// the submit button. `FormSkeleton` takes it too, so a form does not move when
// it replaces its skeleton.
export const formStyles = tv({
  base: "flex w-full flex-col gap-y-4.5",
});
