import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@base-ui/react/form";

export function SignInForm() {
  return (
    <Form className="flex w-full flex-col gap-y-4">
      <Field.Root name="email">
        <Field.Label>Email</Field.Label>
        <Field.Control
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field.Root>

      <Field.Root name="password">
        <Field.Label>Password</Field.Label>
        <Field.Control
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Field.Root>

      <Button type="submit">Sign in</Button>
    </Form>
  );
}
