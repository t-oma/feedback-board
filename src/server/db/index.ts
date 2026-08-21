import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../env";
import { relations } from "./relations";

const createDb = () => drizzle(env.DATABASE_URL, { relations });

const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof createDb>;
};

export const db = globalForDb.db ?? createDb();

if (env.FEEDBACK_BOARD_ENV !== "prod") globalForDb.db = db;
