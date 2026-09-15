import { SignOutButton, signOutAction } from "@/features/auth";
import { requireSession } from "@/features/auth/session.server";

export const instant = false;

export default async function Dashboard() {
  await requireSession({ returnTo: "/dashboard" });

  return (
    <main className="flex flex-1 flex-col gap-y-6 px-5 py-6">
      <h1 className="font-serif text-2xl font-semibold">Dashboard</h1>

      <form action={signOutAction} className="w-full max-w-48">
        <SignOutButton />
      </form>
    </main>
  );
}
