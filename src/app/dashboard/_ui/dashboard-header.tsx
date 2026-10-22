import { BrandLink } from "@/components/brand-link";
import { SiteHeader } from "@/components/site-header";
import { signOutAction } from "@/features/sign-out/actions";
import { SignOutButton } from "@/features/sign-out/ui/sign-out-button";

export function DashboardHeader() {
  return (
    <SiteHeader
      end={
        <form action={signOutAction}>
          <SignOutButton />
        </form>
      }
    >
      <BrandLink />
    </SiteHeader>
  );
}
