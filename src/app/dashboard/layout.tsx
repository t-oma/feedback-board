import { DashboardHeader } from "./dashboard-header";

// Shared structure only. Every dashboard page checks the session itself: a
// layout stays mounted across client navigations, so it cannot stand in for
// the check close to the data each page reads.
export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <>
      <DashboardHeader />
      {children}
    </>
  );
}
