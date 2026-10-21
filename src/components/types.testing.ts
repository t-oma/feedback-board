import type { JSXElementConstructor } from "react";

// The names of the components in a module that still accept `className`,
// looking into the namespaces it exports, such as `Field`.
export type AcceptingClassName<Module> = {
  [Name in keyof Module]: Module[Name] extends JSXElementConstructor<
    infer Props
  >
    ? "className" extends keyof Props
      ? Name
      : never
    : Module[Name] extends object
      ? AcceptingClassName<Module[Name]>
      : never;
}[keyof Module];
