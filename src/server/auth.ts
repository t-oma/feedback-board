import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
// `minimal` leaves out Kysely, which Better Auth needs only to connect to a
// database by itself and to run its own migrations. Here the database comes
// through the Drizzle adapter, and drizzle-kit owns the migrations.
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/entities/user/contracts";

import { db } from "./db";
import { schema } from "./db/relations";
import { env } from "./env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema,
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    maxPasswordLength: MAX_PASSWORD_LENGTH,
  },
  plugins: [nextCookies()],
});
