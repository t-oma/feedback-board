import { sql } from "drizzle-orm";
import { PgTimestampConfig, timestamp, uuid } from "drizzle-orm/pg-core";

export function timestamptz<TMode extends PgTimestampConfig["mode"] & {}>(
  name: string,
  config?: Omit<PgTimestampConfig<TMode>, "withTimezone">,
): ReturnType<typeof timestamp<TMode>> {
  return timestamp(name, { ...(config ?? {}), withTimezone: true });
}

export function uuidv7(name: string) {
  return uuid(name).default(sql`uuidv7()`);
}
