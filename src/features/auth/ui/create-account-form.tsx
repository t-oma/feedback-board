"use client";

import { Form } from "@base-ui/react/form";
import type { Route } from "next";
import { useActionState, useState } from "react";

import { Button } from "@/components/button";
import { Field } from "@/components/field";

import { createAccountAction } from "../actions";
import { AuthFormMessage } from "./auth-form-message";
import { usePasswordFocusAfterFormError } from "./use-password-focus";

type CreateAccountFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  returnTo: Route | null;
};

export function CreateAccountForm({
  email,
  onEmailChange,
  returnTo,
}: CreateAccountFormProps) {
  // React resets the form after every action, failed ones included. Name is
  // held here so that it survives; the password is left to the reset.
  const [name, setName] = useState("");
  const [error, formAction, pending] = useActionState(
    createAccountAction,
    null,
  );
  const passwordRef = usePasswordFocusAfterFormError(error);

  return (
    <Form
      action={formAction}
      errors={error?.fieldErrors}
      aria-busy={pending}
      className="flex w-full flex-col gap-y-4"
    >
      {returnTo !== null && (
        <input type="hidden" name="returnTo" value={returnTo} />
      )}

      <AuthFormMessage error={error} />

      <Field.Root name="name">
        <Field.Label>Name</Field.Label>
        <Field.Control
          type="text"
          aria-required="true"
          placeholder="John Doe"
          autoComplete="name"
          value={name}
          onValueChange={setName}
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="text"
          inputMode="email"
          aria-required="true"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onValueChange={onEmailChange}
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <Field.PasswordControl
          ref={passwordRef}
          aria-required="true"
          placeholder="••••••••"
          autoComplete="new-password"
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Button type="submit" pending={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </Form>
  );
}
