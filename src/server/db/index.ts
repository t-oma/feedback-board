import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../env";

const createDb = () => drizzle(env.DATABASE_URL);

const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof createDb>;
};

export const db = globalForDb.db ?? createDb();

if (env.FEEDBACK_BOARD_ENV !== "prod") globalForDb.db = db;
