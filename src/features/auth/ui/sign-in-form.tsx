"use client";

import { Form } from "@base-ui/react/form";
import type { Route } from "next";
import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/button";
import { Field } from "@/components/field";

import { signInAction } from "../actions";
import { AuthFormMessage } from "./auth-form-message";

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
  const passwordRef = useRef<HTMLInputElement>(null);

  // React resets the form after every action, which empties the uncontrolled
  // password and leaves the controlled email alone. The password is therefore
  // the field to fill again.
  useEffect(() => {
    if (error?.code !== "UNAUTHENTICATED") return;

    passwordRef.current?.focus();
  }, [error]);

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
