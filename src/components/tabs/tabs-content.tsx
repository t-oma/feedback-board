import type { PropsWithChildren } from "react";

export function TabsContent({ children }: PropsWithChildren) {
  return (
    <div className="relative grid min-h-32 grid-cols-1 pt-5">{children}</div>
  );
}
