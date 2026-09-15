"use client";

import { Button } from "@/components/button";
import { useFormStatus } from "react-dom";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      showSpinner={pending}
      aria-busy={pending}
    >
      Sign out
    </Button>
  );
}
