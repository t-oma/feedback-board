import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ActionError } from "@/shared/action-result";

import { AuthFormMessage } from "./auth-form-message";

describe("AuthFormMessage", () => {
  it("renders an announced form-level error", () => {
    const error: ActionError = {
      ok: false,
      code: "UNAUTHENTICATED",
      message: "That email and password do not match an account.",
    };

    const markup = renderToStaticMarkup(<AuthFormMessage error={error} />);

    expect(markup).toContain('role="alert"');
    expect(markup).toContain(error.message);
  });

  it("does not duplicate an error that belongs to a field", () => {
    const error: ActionError = {
      ok: false,
      code: "CONFLICT",
      message: "An account already uses this email.",
      fieldErrors: {
        email: ["An account already uses this email."],
      },
    };

    expect(renderToStaticMarkup(<AuthFormMessage error={error} />)).toBe("");
  });
});
