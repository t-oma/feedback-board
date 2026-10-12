import type { PropsWithChildren } from "react";

import { tabsStyles } from "./styles";

export function TabsContent({ children }: PropsWithChildren) {
  return <div className={tabsStyles().content()}>{children}</div>;
}
