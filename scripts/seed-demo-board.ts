import { parseArgs } from "node:util";

import { db } from "@/server/db";
import { DEMO_BOARD_SLUG, seedDemoBoard } from "@/server/db/seed/demo-board";

const usage = "Usage: pnpm db:seed --owner-email <email> [--replace]";

const { values } = parseArgs({
  options: {
    "owner-email": { type: "string" },
    replace: { type: "boolean", default: false },
  },
});

const ownerEmail = values["owner-email"];

if (ownerEmail === undefined) {
  console.error(usage);
  process.exitCode = 1;
} else {
  try {
    await seedDemoBoard({ ownerEmail, replace: values.replace });
    console.log(`Seeded the demo board at /p/${DEMO_BOARD_SLUG}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await db.$client.end();
  }
}
