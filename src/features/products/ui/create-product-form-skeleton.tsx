import { ButtonSkeleton } from "@/components/button";
import { Field } from "@/components/field";
import { FormSkeleton } from "@/components/form";
import { Skeleton } from "@/components/skeleton";

import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_PRODUCT_SLUG_LENGTH,
} from "../contracts";
import { CreateProductIntroSkeleton } from "./create-product-intro";
import { PublicAddressControlSkeleton } from "./public-address-control";

type CreateProductFormSkeletonProps = {
  // The start of every public address, as `CreateProductForm` takes it.
  publicHost: string;
};

// Stands in for `/dashboard` while it streams. It takes the shape of the
// onboarding form, the first state a new account sees there.
export function CreateProductFormSkeleton({
  publicHost,
}: CreateProductFormSkeletonProps) {
  return (
    <Skeleton label="Loading your dashboard">
      <FormSkeleton>
        <CreateProductIntroSkeleton />
        <Field.Skeleton
          label="Product name"
          counter={MAX_PRODUCT_NAME_LENGTH}
        />
        <Field.Skeleton
          label="Public address"
          counter={MAX_PRODUCT_SLUG_LENGTH}
          control={<PublicAddressControlSkeleton prefix={`${publicHost}/p/`} />}
          description="Lowercase letters, numbers and hyphens"
        />
        <Field.Skeleton
          label="Description optional"
          counter={MAX_PRODUCT_DESCRIPTION_LENGTH}
          control="textarea"
        />
        <ButtonSkeleton />
      </FormSkeleton>
    </Skeleton>
  );
}
