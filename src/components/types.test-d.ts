import type { JSXElementConstructor } from "react";
import { expectTypeOf } from "vitest";

import type * as button from "./button";
import type * as field from "./field/exports";
import type * as link from "./link";
import type * as tabs from "./tabs/exports";

// The names of the components in a module that still accept `className`.
type AcceptingClassName<Module> = {
  [Name in keyof Module]: Module[Name] extends JSXElementConstructor<
    infer Props
  >
    ? "className" extends keyof Props
      ? Name
      : never
    : never;
}[keyof Module];

expectTypeOf<AcceptingClassName<typeof button>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof field>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof link>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof tabs>>().toBeNever();
