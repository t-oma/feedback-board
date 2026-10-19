import { BrandLink } from "@/components/brand-link";
import { signOutAction } from "@/features/sign-out/actions";
import { SignOutButton } from "@/features/sign-out/ui/sign-out-button";

export function DashboardHeader() {
  return (
    <header className="layout-grid h-15 shrink-0 border-b border-border bg-surface">
      <div className="flex items-center justify-between gap-x-4">
        <BrandLink />

        <form action={signOutAction}>
          <SignOutButton />
        </form>
      </div>
    </header>
  );
}
