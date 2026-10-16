import type { JSXElementConstructor } from "react";
import { expectTypeOf } from "vitest";

import type * as button from "./button";
import type * as emptyState from "./empty-state";
import type * as errorState from "./error-state";
import type * as field from "./field/exports";
import type * as form from "./form";
import type * as formError from "./form-error";
import type * as link from "./link";
import type * as narrowMain from "./narrow-main";
import type * as notice from "./notice";
import type * as pageMain from "./page-main";
import type * as skeleton from "./skeleton";
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
expectTypeOf<AcceptingClassName<typeof emptyState>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof errorState>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof field>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof form>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof formError>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof link>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof narrowMain>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof notice>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof pageMain>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof skeleton>>().toBeNever();
expectTypeOf<AcceptingClassName<typeof tabs>>().toBeNever();
