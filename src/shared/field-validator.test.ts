import { describe, expect, it } from "vitest";
import * as z from "zod";

import { fieldValidator } from "./field-validator";

const validate = fieldValidator(
  z
    .string()
    .trim()
    .min(1, { error: "Enter a name", abort: true })
    .min(2, { error: "Use at least 2 characters" }),
);

describe("fieldValidator", () => {
  it("accepts a value the schema accepts", () => {
    expect(validate(" Orbit ")).toBeNull();
  });

  it("returns the schema's messages for a value it rejects", () => {
    expect(validate("O")).toEqual(["Use at least 2 characters"]);
    expect(validate("   ")).toEqual(["Enter a name"]);
  });
});
