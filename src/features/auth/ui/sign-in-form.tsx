"use client";

import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@base-ui/react/form";
import { useActionState, useEffect, useRef } from "react";
import { signInAction } from "../actions";
import { AuthFormMessage } from "./auth-form-message";

type SignInFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  returnTo?: string;
};

export function SignInForm({
  email,
  onEmailChange,
  returnTo,
}: SignInFormProps) {
  const [error, formAction, pending] = useActionState(signInAction, null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error?.code !== "UNAUTHENTICATED") return;

    const passwordControl = passwordRef.current;
    if (passwordControl === null) return;

    passwordControl.value = "";
    passwordControl.focus();
  }, [error]);

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

      <Button type="submit" disabled={pending} showSpinner={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </Form>
  );
}
