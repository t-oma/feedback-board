import { Field } from "@base-ui/react/field";

export type FieldCounterProps = {
  count: number;
  max: number;
};

// A description of the field, so Base UI adds it to the control's
// `aria-describedby`.
export function FieldCounter({ count, max }: FieldCounterProps) {
  return (
    <Field.Description className="shrink-0 font-mono text-xs text-foreground-subtle">
      <span aria-hidden="true">
        {/* Past the maximum the count is underlined as well as red: the red
            is about as dark as the resting grey, 1.45:1, and small text barely
            shows a change of hue. An invalid field leaves the count alone,
            since its error need not be about length. */}
        <span
          className={
            count > max
              ? "text-danger underline decoration-wavy underline-offset-2"
              : undefined
          }
        >
          {count}
        </span>{" "}
        / {max}
      </span>
      <span className="sr-only">
        {count} of {max} characters
      </span>
    </Field.Description>
  );
}
