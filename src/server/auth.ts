import "server-only";

import { betterAuth } from "better-auth";
import { db } from "./db";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { env } from "./env";
import { nextCookies } from "better-auth/next-js";
import { schema } from "./db/relations";

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
  },
  plugins: [nextCookies()],
});
