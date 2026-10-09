import * as z from "zod";

import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_PRODUCT_SLUG_LENGTH,
  MIN_PRODUCT_NAME_LENGTH,
  MIN_PRODUCT_SLUG_LENGTH,
} from "./contracts";

export function normalizeProductName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

// The line breaks are converted first. A browser keeps LF in the field but
// sends every line break as CRLF, so without the conversion a description the
// counter shows at the limit would fail here by one character per line break,
// and CRLF would reach the database.
export function normalizeProductDescription(value: string) {
  return value.replace(/\r\n?/g, "\n").trim();
}

// The MVP specification fixes this order. Removing unsupported characters
// after the spaces become hyphens is what turns "Orbit CLI!" into "orbit-cli"
// rather than "orbitcli".
export function normalizeProductSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[ _]/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

// A name may be longer than an address is allowed to be, and a suggestion the
// form then rejects would put an error under a field nobody has touched. The
// cut can end on a hyphen, which goes as well.
export function suggestProductSlug(name: string) {
  return normalizeProductSlug(name)
    .slice(0, MAX_PRODUCT_SLUG_LENGTH)
    .replace(/-$/, "");
}

// The design names the fix rather than the limit, since the counter beside
// the field already shows the limit.
function removeExcess(maximum: number) {
  return ({ input }: { input: unknown }) => {
    const excess = String(input).length - maximum;
    return `Remove ${excess} ${excess === 1 ? "character" : "characters"}`;
  };
}

const latinSlugMessage = "Use Latin letters, numbers and hyphens";

// `abort` keeps an empty value to the one message that says what to enter,
// instead of adding the minimum length below it.
const productNameSchema = z
  .string({ error: "Enter a product name" })
  .overwrite(normalizeProductName)
  .min(1, { error: "Enter a product name", abort: true })
  .min(MIN_PRODUCT_NAME_LENGTH, {
    error: `Use at least ${MIN_PRODUCT_NAME_LENGTH} characters`,
  })
  .max(MAX_PRODUCT_NAME_LENGTH, {
    error: removeExcess(MAX_PRODUCT_NAME_LENGTH),
  });

// An address that normalizes to nothing was typed in another script, or not
// typed at all; either way, the message says which characters work.
const productSlugSchema = z
  .string({ error: latinSlugMessage })
  .overwrite(normalizeProductSlug)
  .min(1, { error: latinSlugMessage, abort: true })
  .min(MIN_PRODUCT_SLUG_LENGTH, {
    error: `Use at least ${MIN_PRODUCT_SLUG_LENGTH} characters`,
  })
  .max(MAX_PRODUCT_SLUG_LENGTH, {
    error: removeExcess(MAX_PRODUCT_SLUG_LENGTH),
  });

const productDescriptionSchema = z
  .string()
  .overwrite(normalizeProductDescription)
  .max(MAX_PRODUCT_DESCRIPTION_LENGTH, {
    error: removeExcess(MAX_PRODUCT_DESCRIPTION_LENGTH),
  });

export const createProductSchema = z.object({
  name: productNameSchema,
  slug: productSlugSchema,
  description: productDescriptionSchema,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
