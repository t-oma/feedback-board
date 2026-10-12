"use client";

import { useState } from "react";

import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@/components/form";
import { FormError } from "@/components/form-error";
import { Link } from "@/components/link";
import { buildSignInHref } from "@/features/auth/navigation";
import { fieldValidator } from "@/shared/field-validator";
import { useFocusAfterFormError } from "@/shared/use-focus-after-form-error";

import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_PRODUCT_SLUG_LENGTH,
} from "../contracts";
import {
  createProductSchema,
  normalizeProductDescription,
  normalizeProductName,
  normalizeProductSlug,
  suggestProductSlug,
} from "../schemas";
import { useCreateProduct } from "./create-product-provider";
import { PublicAddressControl } from "./public-address-control";

const validateName = fieldValidator(createProductSchema.shape.name);
const validateSlug = fieldValidator(createProductSchema.shape.slug);
const validateDescription = fieldValidator(
  createProductSchema.shape.description,
);

type CreateProductFormProps = {
  // The start of every public address, such as `feedbackboard.app`.
  publicHost: string;
};

export function CreateProductForm({ publicHost }: CreateProductFormProps) {
  const { state, formAction, pending } = useCreateProduct();
  // React resets the form after every action, failed ones included, so every
  // value is held here and survives it.
  const [name, setName] = useState("");
  // `null` while the address follows the name. The first edit makes it the
  // person's own, and later changes to the name leave it alone.
  const [editedSlug, setEditedSlug] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const slug = editedSlug ?? suggestProductSlug(name);

  const error = state?.ok === false ? state : null;
  // Every value survives a failed submit, so submitting again is the next
  // step.
  const bannerRef = useFocusAfterFormError<HTMLDivElement>(error);

  return (
    <Form action={formAction} errors={error?.fieldErrors} aria-busy={pending}>
      <div className="flex flex-col gap-y-2">
        <h1 className="font-serif text-2xl font-semibold">Create your board</h1>
        <p className="text-sm text-foreground-muted">
          Everything here can be changed later in Settings.
        </p>
      </div>

      <FormError message={error?.message} ref={bannerRef} />
      {error?.code === "UNAUTHENTICATED" && (
        <Link
          variant="secondary"
          href={buildSignInHref({ returnTo: "/dashboard" })}
        >
          Sign in again
        </Link>
      )}

      <Field.Root name="name" validate={validateName}>
        <Field.Label
          counter={{
            count: normalizeProductName(name).length,
            max: MAX_PRODUCT_NAME_LENGTH,
          }}
        >
          Product name
        </Field.Label>
        <Field.Control
          type="text"
          autoComplete="off"
          placeholder="Orbit CLI"
          value={name}
          onValueChange={setName}
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="slug" validate={validateSlug}>
        <Field.Label
          counter={{
            count: normalizeProductSlug(slug).length,
            max: MAX_PRODUCT_SLUG_LENGTH,
          }}
        >
          Public address
        </Field.Label>
        <PublicAddressControl
          prefix={`${publicHost}/p/`}
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          placeholder="orbit-cli"
          spellCheck={false}
          value={slug}
          onValueChange={setEditedSlug}
          readOnly={pending}
        />
        <Field.Description>
          Lowercase letters, numbers and hyphens
        </Field.Description>
        <Field.Error />
      </Field.Root>

      <Field.Root name="description" validate={validateDescription}>
        <Field.Label
          counter={{
            count: normalizeProductDescription(description).length,
            max: MAX_PRODUCT_DESCRIPTION_LENGTH,
          }}
        >
          Description{" "}
          <span className="font-mono text-xs font-normal text-foreground-subtle">
            optional
          </span>
        </Field.Label>
        <Field.Textarea
          value={description}
          onValueChange={setDescription}
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Button type="submit" pending={pending}>
        {pending ? "Creating…" : "Create board"}
      </Button>
    </Form>
  );
}
