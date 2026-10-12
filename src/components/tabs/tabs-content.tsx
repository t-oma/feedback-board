import type { PropsWithChildren } from "react";

import { contentClassName } from "./geometry";

export function TabsContent({ children }: PropsWithChildren) {
  return <div className={contentClassName}>{children}</div>;
}
