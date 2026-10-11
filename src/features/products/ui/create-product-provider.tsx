"use client";

import { createContext, type ReactNode, use, useActionState } from "react";

import { createProductAction, type CreateProductResult } from "../actions";

type CreateProduct = {
  state: CreateProductResult | null;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

const CreateProductContext = createContext<CreateProduct | null>(null);

// Holds the create-product action state above both dashboard states, which the
// page chooses between on the server. The action's `refresh()` swaps the form
// for the owner state; this provider stays at the same position in both, so
// React keeps its state and the owner state can say what just happened. A
// reload starts it empty, which keeps that to one visit.
export function CreateProductProvider({ children }: { children: ReactNode }) {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    null,
  );

  return (
    <CreateProductContext value={{ state, formAction, pending }}>
      {children}
    </CreateProductContext>
  );
}

export function useCreateProduct() {
  const createProduct = use(CreateProductContext);

  if (createProduct === null) {
    throw new Error("useCreateProduct needs a CreateProductProvider above it");
  }

  return createProduct;
}
