import { PageMain } from "@/components/page-main";
import { appOrigin } from "@/server/env";

import { OwnerOverviewSkeleton } from "./_ui/owner-overview";

// Stands in for the owner's board, which most visits to the dashboard show.
export default function DashboardLoading() {
  return (
    <PageMain>
      <OwnerOverviewSkeleton origin={appOrigin} />
    </PageMain>
  );
}
