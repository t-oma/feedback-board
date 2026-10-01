import type { ReactNode } from "react";

type AuthMainProps = {
  children: ReactNode;
};

export function AuthMain({ children }: AuthMainProps) {
  return (
    <main className="flex flex-1 flex-col gap-y-5 overflow-x-clip bg-surface px-5 py-6">
      {children}
    </main>
  );
}
