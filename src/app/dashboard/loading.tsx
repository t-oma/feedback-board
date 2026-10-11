import { NarrowMain } from "@/components/narrow-main";
import { CreateProductFormSkeleton } from "@/features/products/ui/create-product-form-skeleton";

export default function DashboardLoading() {
  return (
    <NarrowMain>
      <CreateProductFormSkeleton />
    </NarrowMain>
  );
}
