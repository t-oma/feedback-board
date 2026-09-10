import { Button } from "@/components/button";
import { Field } from "@/components/field";
import { Form } from "@base-ui/react/form";

export function CreateAccountForm() {
  return (
    <Form className="flex w-full flex-col gap-y-4">
      <Field.Root name="name">
        <Field.Label>Name</Field.Label>
        <Field.Control
          type="text"
          required
          placeholder="John Doe"
          autoComplete="name"
        />
      </Field.Root>

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
        <Field.PasswordControl
          required
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field.Root>

      <Button type="submit">Create account</Button>
    </Form>
  );
}
