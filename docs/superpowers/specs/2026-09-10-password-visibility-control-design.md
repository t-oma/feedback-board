# Password visibility control design

## Goal

Let users reveal and hide the password in the sign-in and account-creation forms. Keep passwords hidden by default, preserve native form behavior, and avoid turning unrelated text and email controls into Client Components.

## Component boundary

Add `Field.PasswordControl` as a dedicated Client Component beside the existing `Field.Control`. It owns only the visibility state and composes the existing control instead of duplicating its base styles. `Field.Root`, `Field.Label`, and the auth forms remain server-compatible.

`Field.PasswordControl` accepts the same input attributes needed by the current password fields, including `name`, `id`, `required`, `placeholder`, and `autoComplete`. It owns the input `type`, so consumers cannot pass a conflicting value. Like the other shared field components, it does not accept a custom `className`.

Both auth forms replace their current `Field.Control type="password"` with `Field.PasswordControl`. Their field names and autocomplete values remain unchanged:

- sign-in uses `current-password`;
- account creation uses `new-password`.

## Structure and styling

Render the existing control inside a full-width, relatively positioned wrapper. A descendant selector makes the input fill that wrapper and adds enough right padding for the action without changing the spacing of other field types.

Place a native icon button at the right edge of the 48-pixel-high control. Use the existing Lucide dependency:

- show `EyeIcon` while the password is hidden;
- show `EyeOffIcon` while the password is visible.

The button uses the project's foreground and focus tokens, has a visible hover state, and keeps the existing field border and dimensions intact. The icon is decorative and receives `aria-hidden="true"`.

## Interaction and data flow

The control starts with `type="password"`. Activating the icon changes the same input element to `type="text"`; activating it again restores `type="password"`. The component does not own or copy the input value, so browser autofill, password managers, native validation, and `FormData` keep using the original input.

The visibility state remains unchanged when the input loses focus. It resets only when the component unmounts, such as when navigation switches auth modes. The action button uses `type="button"`, so it never submits the surrounding form.

Set `spellCheck={false}` and `autoCapitalize="none"` by default. Consumers continue to provide the appropriate `autoComplete` value.

## Accessibility

Resolve a stable input ID from the supplied `id` or React's `useId`. Connect the action to that input with `aria-controls`.

The button's accessible label describes its next action:

- `Show password` while the password is hidden;
- `Hide password` while the password is visible.

Do not add `aria-pressed`, because the accessible label changes with the action. The native button remains keyboard reachable and works with Enter and Space. Focus stays on the button after activation.

The current forms each contain one password field. If a future form contains more than one, its controls will need labels that identify the matching field.

## Storybook and verification

Update the existing `Components/Field` Password story to use `Field.PasswordControl`. Do not add a production prop solely to force the visible state in a second story.

Verify in Storybook that:

1. The field starts obscured and uses the eye icon.
2. Mouse and keyboard activation reveal and hide the same value.
3. The accessible label and icon update together.
4. The toggle does not submit a surrounding form.
5. The input and button have visible, non-overlapping focus states.

Run Prettier, ESLint, TypeScript, Vitest, the Next.js production build, and the Storybook production build. The repository does not yet have a browser component-test setup, so this change does not add a test dependency solely for the visibility toggle.

## Out of scope

This change does not add password confirmation, a strength meter, copy controls, or automatic hiding on blur. It does not change password validation or submission behavior.

## Sources

- [GOV.UK Design System password input](https://design-system.service.gov.uk/components/password-input/)
- [WAI-ARIA Authoring Practices button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
