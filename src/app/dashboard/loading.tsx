import { NarrowMain } from "@/components/narrow-main";
import { env } from "@/server/env";

import { OwnerOverviewSkeleton } from "./_ui/owner-overview";

// Stands in for the owner's board, which most visits to the dashboard show.
export default function DashboardLoading() {
  return (
    <NarrowMain>
      <OwnerOverviewSkeleton origin={new URL(env.BETTER_AUTH_URL).origin} />
    </NarrowMain>
  );
}
