import type { ReactNode } from "react";

import { BrandLink } from "@/components/brand-link";
import { SiteHeader } from "@/components/site-header";

type DashboardHeaderProps = {
  // The layout passes `ViewerControl`, which reads the session, and a story
  // passes what it renders.
  viewer: ReactNode;
};

export function DashboardHeader({ viewer }: DashboardHeaderProps) {
  return (
    <SiteHeader end={viewer}>
      <BrandLink />
    </SiteHeader>
  );
}
