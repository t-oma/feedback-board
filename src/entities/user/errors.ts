import { BASE_ERROR_CODES } from "better-auth";
import { isAPIError } from "better-auth/api";

type AuthErrorKind = "invalidCredentials" | "emailAlreadyRegistered";

export function classifyAuthError(error: unknown): AuthErrorKind | null {
  if (!isAPIError(error)) return null;

  switch (error.body?.code) {
    case BASE_ERROR_CODES.INVALID_EMAIL_OR_PASSWORD.code:
      return "invalidCredentials";
    case BASE_ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL.code:
      return "emailAlreadyRegistered";
    default:
      return null;
  }
}
