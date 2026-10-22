"use client";

import { useFormStatus } from "react-dom";

import { Menu } from "@/components/menu";
import { useCurrentPath } from "@/shared/use-current-path";

import { signOutAction } from "../actions";

export function SignOutMenuItem() {
  return (
    <form action={signOutAction}>
      <input type="hidden" name="returnTo" value={useCurrentPath()} />
      <SignOutItem />
    </form>
  );
}

// The menu stays open while the action runs: Base UI unmounts a closed popup,
// and the form with it, so the visitor would see nothing until the redirect.
// A disabled item keeps its focus, which Base UI gives every menu item.
function SignOutItem() {
  const { pending } = useFormStatus();

  return (
    <Menu.Item
      nativeButton
      render={<button type="submit" />}
      closeOnClick={false}
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Menu.Item>
  );
}
