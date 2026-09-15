import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { resolve } from "node:path";
import { Pool } from "pg";
import { e2eEnvironment } from "./load-environment";

export default async function globalSetup() {
  const pool = new Pool({
    connectionString: e2eEnvironment.DATABASE_URL_UNPOOLED,
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
