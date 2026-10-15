import { NarrowMain } from "@/components/narrow-main";
import { CreateProductFormSkeleton } from "@/features/create-product/ui/create-product-form-skeleton";
import { env } from "@/server/env";

export default function NewBoardLoading() {
  return (
    <NarrowMain>
      <CreateProductFormSkeleton
        publicHost={new URL(env.BETTER_AUTH_URL).host}
      />
    </NarrowMain>
  );
}
