"use client";

import type { Route } from "next";
import { useActionState } from "react";

import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@/components/form";
import { FormError } from "@/components/form-error";
import { useFocusAfterFormError } from "@/shared/use-focus-after-form-error";

import { signInAction } from "../actions";

type SignInFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  returnTo: Route | null;
};

export function SignInForm({
  email,
  onEmailChange,
  returnTo,
}: SignInFormProps) {
  const [error, formAction, pending] = useActionState(signInAction, null);
  // The password is cleared after a failed submit, so typing it again is
  // the next step.
  const passwordRef = useFocusAfterFormError<HTMLInputElement>(error);

  return (
    <Form action={formAction} errors={error?.fieldErrors} aria-busy={pending}>
      {returnTo !== null && (
        <input type="hidden" name="returnTo" value={returnTo} />
      )}

      <FormError message={error?.message} />

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
          autoComplete="current-password"
          readOnly={pending}
        />
        <Field.Error />
      </Field.Root>

      <Button type="submit" pending={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </Form>
  );
}
