import { BrandLink } from "@/components/brand-link";
import {
  BackLink,
  BackLinkSkeleton,
  SiteHeader,
} from "@/components/site-header";

import type { AuthBackTarget } from "./auth-back-target";

type AuthHeaderProps = {
  backTarget: AuthBackTarget;
};

export function AuthHeader({ backTarget }: AuthHeaderProps) {
  return (
    <SiteHeader
      back={
        <BackLink href={backTarget.href} label={getBackLabel(backTarget)} />
      }
    >
      <BrandLink />
    </SiteHeader>
  );
}

export function AuthHeaderSkeleton() {
  return (
    <SiteHeader back={<BackLinkSkeleton />}>
      <BrandLink />
    </SiteHeader>
  );
}

function getBackLabel(target: AuthBackTarget): string {
  switch (target.kind) {
    case "home":
      return "Back to Feedback Board";
    case "board":
      return `Back to ${target.slug}`;
    case "feedback":
      return "Back to feedback";
    case "changelog":
      return "Back to changelog";
  }
}
