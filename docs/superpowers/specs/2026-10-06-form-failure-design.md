# Form failure design

## Goal

Keep what a person typed when a form submission fails, show every failure somewhere they can see it, and type the field errors an action returns.

The change covers the two auth forms and the shared action error contract. Later forms, such as onboarding, follow the rules it sets.

## Why

- **A failed submit empties the form.** React calls `requestFormReset` before it runs any form action (`startHostTransition` in the React DOM that Next.js 16.3.1 bundles), and Base UI's `Form` passes `action` to a native `<form>`. Every uncontrolled field resets after the action returns, whatever it returned. A story on `main` reproduced it: after an email conflict in create-account, Name was empty, Email survived because `AuthTabs` holds it in state, and the password was empty. The onboarding specification requires a taken-slug error to leave every value in place, so the next slice depends on this.
- **An unexpected failure replaces the form.** Both actions rethrow anything they do not recognise, so a database outage during sign-in renders `error.tsx` and everything typed is gone. The design's "11 · Mutation failure" state keeps the form and shows one banner instead. Artem decided on 2026-09-24 that the banner wins for writes and `error.tsx` stays for reads.
- **A form-level validation error is shown nowhere.** `toValidationActionError` keeps Zod's `fieldErrors` and drops `formErrors`, and it always sets `fieldErrors`, even to `{}`. `AuthFormMessage` hides as soon as `fieldErrors` is defined. An object-level check without a `path` would therefore produce a submit that does nothing visible. No schema in `src` has such a check today, but Zod 4.4.3 runs an object's `refine` even when a field has already failed, so the first one would hit this.
- **Field names are not checked.** `fieldErrors` is a `Record<string, string[]>`, so `{ emial: [...] }` compiles, and Base UI shows the message under no field. Zod already infers the keys; `toValidationActionError` throws them away.

## Action error contract

`src/shared/action-result.ts`:

```ts
export type FieldErrors<Input> = { [Field in keyof Input]?: string[] };

export type ActionError<Input = Record<string, unknown>> = {
  ok: false;
  code:
    | "VALIDATION"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "UNEXPECTED";
  message?: string;
  fieldErrors?: FieldErrors<Input>;
};
```

`ActionResult<T, Input>` passes `Input` through to its error variant.

- `message` is form-level text, and the form shows it in its banner. It is absent when the fields carry everything there is to say.
- `fieldErrors` holds messages for named fields. It is absent when no field has one, never `{}`.
- Every error has a `message`, `fieldErrors`, or both.

A mapped type whose keys are all optional accepts `{}`, so the types cannot enforce the last two rules. `toValidationActionError` enforces them and its unit test checks them.

`toValidationActionError<Input>(error: z.ZodError<Input>): ActionError<Input>` reads both halves of `z.flattenError(error)`. Zod's `formErrors` become `message`, joined with a space when there are several. `fieldErrors` is included only when it has a key. The constant "Check the highlighted fields" is removed; no one ever saw it, because the banner hid whenever `fieldErrors` was defined.

Each action declares its input: `Promise<ActionError<SignInInput>>` and `Promise<ActionError<CreateAccountInput>>`. A probe confirmed that `{ emial: [...] }` then fails with "Did you mean to write 'email'?", and that Base UI's `Form`, `AuthFormMessage` and both forms accept the typed field errors unchanged.

What each code sets in the auth actions:

| Case                                 | `message` | `fieldErrors`            |
| ------------------------------------ | --------- | ------------------------ |
| `VALIDATION`, field issues only      | no        | yes                      |
| `VALIDATION`, object-level issues    | yes       | when a field also failed |
| `UNAUTHENTICATED`, wrong credentials | yes       | no                       |
| `CONFLICT`, email taken              | no        | `email`                  |
| `UNEXPECTED`                         | yes       | no                       |

## Unexpected failures

Each action keeps its `try` around the Better Auth call and changes its `catch`:

1. `unstable_rethrow(error)` first, so a Next.js control-flow error such as a redirect is never reported as a failure. The Next.js documentation asks for this in a `catch` around application code.
2. A recognised Better Auth error maps to its code, as today.
3. Anything else is logged with `console.error`, naming the action, and returned as `UNEXPECTED`. Once the action catches the error, Next.js no longer logs it, so the action must.

The logging and the returned value live in one server-only helper, so both actions log the same way and return the same text.

The message is "We couldn’t complete your request. Please try again." in both modes. The design gives create-account its own text, "Your account was not created. Please try again.", but its own note says the banner "makes no claim about whether the request reached the server". Our adapter runs sign-up in a transaction: Better Auth wraps the handler in `runWithTransaction`, which calls the adapter's `transaction`, and `src/server/auth.ts` turns that on with `transaction: true`. A failure inside Better Auth therefore leaves no user behind. A commit whose acknowledgement is lost on the way back would still make that text false, and a retry would then report the email as taken. The neutral text is true in every case.

`signOutAction` does not change. It has no typed text to lose, so an unexpected failure still reaches `error.tsx`.

## Values after a failed submit

A field whose value must survive a failed submit is controlled. A password field stays uncontrolled, so the form reset clears it, which is what the design asks for: "Form stays filled apart from the password."

- `CreateAccountForm` holds Name in local state. Email is already controlled through `AuthTabs`.
- `SignInForm` stops clearing the password by hand after `UNAUTHENTICATED`. The reset already clears it, and a story checks that it does. The effect keeps moving focus to the password.

The same probe confirmed the fix: with Name controlled, it kept "Marta" after the conflict, and the password was still cleared.

## Focus

- Field errors: Base UI's `Form` moves focus to the first invalid field after a submit whose `errors` change (`focusFirstInvalid` in `@base-ui/react/form/Form.js`). Nothing to add.
- An error with a `message` and no `fieldErrors`: both auth forms move focus to the password, because the password is the field the person has to fill again. The banner keeps `role="alert"`, so it is still announced.

The design's state 11 moves focus to the banner itself. That fits forms that keep every value, such as add feedback and product settings, where the next step is to submit again. The auth forms clear the password, so the next step is the password field. The MVP specification records both rules.

## Banner

`AuthFormMessage` renders when `error.message` is defined and stays as it is otherwise. When an error has both, the banner and the field errors show together.

The design draws a "Try again" button inside the banner. The auth forms leave it out: the submit button already retries, and the password has to be typed again before a retry can work.

## Specification updates

In the MVP specification:

- the `ActionError` block, its generic input, the `UNEXPECTED` code, and what `message` and `fieldErrors` mean;
- "Error handling and states": unexpected failures in a write return `UNEXPECTED` and keep the form; unexpected failures in a read still reach `error.tsx`;
- the two rules above, on controlled fields and on where focus goes after a form-level error.

The onboarding specification lives on `feat/mobile-product-onboarding`, which is not in `main`. Its sentence sending database failures to route error UI is superseded by this one, and changes when the products slice picks that branch up.

## Tests

Unit:

- `toValidationActionError`: field issues only, object-level issues only, and both. Each case checks which of `message` and `fieldErrors` is present, and that `fieldErrors` is never `{}`.
- Both actions: an unknown error returns `UNEXPECTED` and calls `console.error`; a Next.js redirect error thrown inside the `try` is rethrown, not reported.
- The existing expectations change with the contract: `VALIDATION` without the constant message, the email `CONFLICT` without `message`, and "rethrows unexpected errors" becomes "returns UNEXPECTED".

Stories, through the actions mock from the auth-navigation change, in `auth-tabs.stories.tsx`:

- create-account with the email taken: Name and Email keep their values, the password is empty, and the email field shows the conflict;
- sign-in with wrong credentials: Email keeps its value, the password is empty and focused, and the banner is announced;
- an `UNEXPECTED` result in each mode: the banner shows the neutral text, and focus is on the password;
- a `VALIDATION` result with both halves: the banner and the field error are both visible.

`auth-form-message.stories.tsx` drops the field-scoped story's `message` and adds the combined case.

The end-to-end tests do not change. `pnpm verify` and `pnpm build-storybook` pass.

## Out of scope

- A wrapper around whole actions. A programming error outside the Better Auth call still reaches `error.tsx`.
- Moving focus to the banner and a shared form banner component. Both come with the first form that keeps every value.
- Sign-out failures, which keep the route boundary.
- Rate limiting for the Server Action door, which the MVP specification already defers.

## Sources

- React's form reset: `startHostTransition` in `next/dist/compiled/react-dom/cjs/react-dom-client.production.js`.
- `unstable_rethrow`: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_rethrow.md`.
- Base UI focus after server errors: `focusFirstInvalid` in `node_modules/@base-ui/react/form/Form.js`.
- Zod's error halves: `flattenError` in `node_modules/zod/v4/core/errors.d.ts`.
- Better Auth sign-up order and transaction: `dist/api/routes/sign-up.mjs` in `better-auth` 1.7.1.
- Design: "11 · Mutation failure" and the auth section's "Unexpected error" in `docs/desktop-design.dc.html`.
