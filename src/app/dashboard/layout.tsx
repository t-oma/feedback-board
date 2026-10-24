import { ViewerControl } from "@/widgets/viewer/ui/viewer-control";

import { DashboardHeader } from "./_ui/dashboard-header";

// The header shows the viewer, but every dashboard page checks the session
// itself: a layout stays mounted across client navigations, so it cannot
// stand in for the check close to the data each page reads.
export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <>
      <DashboardHeader viewer={<ViewerControl expectSignedIn />} />
      {children}
    </>
  );
}
