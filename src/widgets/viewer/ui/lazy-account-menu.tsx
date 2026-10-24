"use client";

import dynamic from "next/dynamic";

import { AvatarSkeleton } from "@/components/avatar";

// The menu brings Base UI's menu, which a guest never opens. Imported from a
// Client Component, because Next.js does not split a Client Component that a
// Server Component imports dynamically, so the chunk loads only for a
// signed-in visitor.
export const LazyAccountMenu = dynamic(
  () => import("./account-menu").then((module) => module.AccountMenu),
  { loading: () => <AvatarSkeleton /> },
);
