import { FormPanel } from "@/components/form-panel";
import { PageMain } from "@/components/page-main";
import { CreateProductFormSkeleton } from "@/features/create-product/ui/create-product-form-skeleton";
import { appOrigin } from "@/server/env";

export default function NewBoardLoading() {
  return (
    <PageMain align="stretch">
      <FormPanel>
        <CreateProductFormSkeleton origin={appOrigin} />
      </FormPanel>
    </PageMain>
  );
}
