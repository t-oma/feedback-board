import * as z from "zod";

import {
  productDescriptionSchema,
  productNameSchema,
  productSlugSchema,
} from "@/entities/product/schemas";

export const createProductSchema = z.object({
  name: productNameSchema,
  slug: productSlugSchema,
  description: productDescriptionSchema,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
