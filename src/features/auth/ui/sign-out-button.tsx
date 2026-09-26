"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/button";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" pending={pending}>
      Sign out
    </Button>
  );
}
