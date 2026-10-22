"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { parseReturnTo } from "@/entities/user/navigation";
import { auth } from "@/server/auth";
import { appOrigin } from "@/server/env";

// Back to the page the form was on, protected or not: the proxy decides which
// pages need a session, so this keeps no list of its own.
export async function signOutAction(formData: FormData) {
  await auth.api.signOut({ headers: await headers() });
  redirect(parseReturnTo(formData.get("returnTo"), appOrigin) ?? "/");
}
