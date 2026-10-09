import { resolve } from "node:path";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { testEnvironment } from "./load-environment";

// Playwright and the `db` Vitest project both run this before their tests.
// Each accepts a default-exported function, so one file serves both.
export default async function globalSetup() {
  const pool = new Pool({
    connectionString: testEnvironment.DATABASE_URL_UNPOOLED,
    max: 1,
  });
  const database = drizzle({ client: pool });

  try {
    const result = await migrate(database, {
      migrationsFolder: resolve(process.cwd(), "drizzle"),
    });

    if (result) {
      throw new Error(`Drizzle migration setup failed: ${result.exitCode}`);
    }
  } finally {
    await pool.end();
  }
}
