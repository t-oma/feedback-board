import { FormPanel } from "@/components/form-panel";
import { PageMain } from "@/components/page-main";
import { CreateProductFormSkeleton } from "@/features/create-product/ui/create-product-form-skeleton";
import { env } from "@/server/env";

export default function NewBoardLoading() {
  return (
    <PageMain align="stretch">
      <FormPanel>
        <CreateProductFormSkeleton
          publicHost={new URL(env.BETTER_AUTH_URL).host}
        />
      </FormPanel>
    </PageMain>
  );
}
