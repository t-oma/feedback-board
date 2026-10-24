"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { Menu } from "@/components/menu";

import { signOutAction } from "../actions";

// Signs out, then asks for this page again. The new request meets the proxy,
// which sends it to sign in when the page needs a session, while a public
// page comes back without one. A redirect from the action would not do:
// Next.js fetches the target on the server and returns what it gets under the
// address the action named, so the proxy's answer, the sign-in form, would
// show under the dashboard's address.
export function SignOutMenuItem() {
  const router = useRouter();

  return (
    <form
      action={async () => {
        await signOutAction();
        router.refresh();
      }}
    >
      <SignOutItem />
    </form>
  );
}

// The menu stays open while the action runs: Base UI unmounts a closed popup,
// and the form with it, so the visitor would see nothing until the page
// changes. A disabled item keeps its focus, which Base UI gives every menu
// item.
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
