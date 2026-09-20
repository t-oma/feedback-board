import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL_UNPOOLED;

if (url === undefined) {
  throw new Error(
    "DATABASE_URL_UNPOOLED must be set to run drizzle-kit. It is the direct connection, not the pooled one.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
});
