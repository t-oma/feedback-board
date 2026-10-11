import type { Metadata } from "next";

import { NarrowMain } from "@/components/narrow-main";
import { requireSession } from "@/features/auth/session.server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
  await requireSession({ returnTo: "/dashboard" });

  return (
    <NarrowMain>
      <h1 className="font-serif text-2xl font-semibold">Dashboard</h1>
    </NarrowMain>
  );
}
