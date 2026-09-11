"use client";

import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@base-ui/react/form";
import { useActionState } from "react";
import { createAccountAction } from "../actions";
import { AuthFormMessage } from "./auth-form-message";

type CreateAccountFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  returnTo?: string;
};

export function CreateAccountForm({
  email,
  onEmailChange,
  returnTo,
}: CreateAccountFormProps) {
  const [error, formAction, pending] = useActionState(
    createAccountAction,
    null,
  );

  return (
    <Form
      action={formAction}
      errors={error?.fieldErrors}
      aria-busy={pending}
      className="flex w-full flex-col gap-y-4"
    >
      {returnTo !== undefined && (
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
          aria-required="true"
          placeholder="••••••••"
          autoComplete="new-password"
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Button type="submit" disabled={pending} showSpinner={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </Form>
  );
}
