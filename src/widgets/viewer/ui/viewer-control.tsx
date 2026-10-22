import { Suspense } from "react";

import { AvatarSkeleton } from "@/components/avatar";
import { getSession } from "@/entities/user/session.server";

import { AccountMenu } from "./account-menu";
import { SignInLink } from "./sign-in-link";

type ViewerControlProps = {
  // For a route that lets only a signed-in visitor in: the wait shows where
  // the avatar will be. Elsewhere most visitors are guests, so it shows
  // nothing rather than a guess.
  expectSignedIn?: boolean;
};

// The session streams in on its own, so the rest of the page does not wait
// for it.
export function ViewerControl({ expectSignedIn = false }: ViewerControlProps) {
  return (
    <Suspense fallback={expectSignedIn ? <AvatarSkeleton /> : null}>
      <Viewer />
    </Suspense>
  );
}

async function Viewer() {
  const session = await getSession();
  if (session === null) return <SignInLink />;

  // Only what the menu shows crosses to the client, not the session itself.
  return <AccountMenu name={session.user.name} email={session.user.email} />;
}
