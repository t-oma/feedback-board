import type { Metadata } from "next";

import { signOutAction } from "@/features/auth/actions";
import { requireSession } from "@/features/auth/session.server";
import { SignOutButton } from "@/features/auth/ui/sign-out-button";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
  await requireSession({ returnTo: "/dashboard" });

  return (
    <main className="flex flex-1 flex-col gap-y-6 px-5 py-6">
      <h1 className="font-serif text-2xl font-semibold">Dashboard</h1>

      <form action={signOutAction}>
        <SignOutButton />
      </form>
    </main>
  );
}
