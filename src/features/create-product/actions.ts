"use server";

import { redirect, RedirectType, unstable_rethrow } from "next/navigation";

import { classifyProductError } from "@/entities/product/errors";
import { getSession } from "@/entities/user/session.server";
import { toUnexpectedActionError } from "@/server/action-errors";
import { db } from "@/server/db";
import { products } from "@/server/db/schema/products";
import {
  type ActionError,
  toValidationActionError,
} from "@/shared/action-result";

import { type CreateProductInput, createProductSchema } from "./schemas";

// Only failures come back: a created board redirects to the dashboard.
export type CreateProductResult = ActionError<CreateProductInput>;

export async function createProductAction(
  _previousState: CreateProductResult | null,
  formData: FormData,
): Promise<CreateProductResult> {
  const parsedInput = createProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    // The form always sends the field, even empty. A request without it is
    // still asking for a board with no description.
    description: formData.get("description") ?? "",
  });

  if (!parsedInput.success) {
    return toValidationActionError(parsedInput.error);
  }

  try {
    const session = await getSession();

    if (session === null) {
      return {
        ok: false,
        code: "UNAUTHENTICATED",
        message: "Your session has ended. Sign in again to create your board.",
      };
    }

    await db
      .insert(products)
      .values({ ...parsedInput.data, ownerId: session.user.id });
  } catch (error) {
    unstable_rethrow(error);

    switch (classifyProductError(error)) {
      // Also when the slug is taken as well: PostgreSQL checks unique indexes
      // in the order they were created, so the owner's comes first. It does
      // not document that order, and `actions.db.test.ts` pins it.
      case "ownerHasProduct":
        return {
          ok: false,
          code: "CONFLICT",
          message: "You already have a board.",
        };
      case "slugTaken":
        return {
          ok: false,
          code: "CONFLICT",
          fieldErrors: {
            slug: ["This slug is already taken. Choose another one."],
          },
        };
      case null:
        return toUnexpectedActionError("createProductAction", error);
    }
  }

  // `replace`, so going back does not return to a form for a board that
  // exists. The parameter tells the dashboard to say the board is live.
  redirect("/dashboard?created=1", RedirectType.replace);
}
