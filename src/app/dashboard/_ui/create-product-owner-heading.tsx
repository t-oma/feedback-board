"use client";

import type { NoticeMessage } from "@/components/notice";
import { useCreateProduct } from "@/features/create-product/ui/create-product-provider";

import { OwnerHeading } from "./owner-heading";

type CreateProductOwnerHeadingProps = {
  productName: string;
};

export function CreateProductOwnerHeading({
  productName,
}: CreateProductOwnerHeadingProps) {
  const { state } = useCreateProduct();

  // A board just created, or the one that already existed when a second was
  // refused. Anything else leaves the owner state to speak for itself.
  const notice: NoticeMessage | null =
    state === null
      ? null
      : state.ok
        ? { text: "Your board is live", variant: "success" }
        : state.message === undefined
          ? null
          : { text: state.message, variant: "info" };

  return <OwnerHeading productName={productName} notice={notice} />;
}
