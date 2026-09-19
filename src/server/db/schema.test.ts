import { getTableConfig, type PgTable } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { schema } from "./relations";

// This file sits beside `relations.ts` rather than in `schema/`, because
// `drizzle.config.ts` points `schema` at that directory and drizzle-kit loads
// every file it finds there. A test module among them breaks `db:generate`.

type TimestampColumn = {
  column: string;
  sqlType: string;
};

// A column without a time zone round-trips through the host's local zone:
// Drizzle writes `Date#toISOString()`, and node-postgres reads the naked value
// back as local time. The offset is invisible on a UTC host and wrong everywhere
// else, so the type is an invariant of the schema rather than a per-table choice.
const tables: PgTable[] = Object.values(schema);

const timestampColumns: TimestampColumn[] = tables.flatMap((table) => {
  const { name, columns } = getTableConfig(table);

  return columns
    .map((column) => ({
      column: `${name}.${column.name}`,
      sqlType: column.getSQLType(),
    }))
    .filter(({ sqlType }) => sqlType.startsWith("timestamp"));
});

describe("schema timestamps", () => {
  it("finds the timestamp columns it is meant to guard", () => {
    expect(timestampColumns.length).toBeGreaterThan(0);
  });

  it("declares every timestamp column with a time zone", () => {
    const withoutTimeZone = timestampColumns.filter(
      ({ sqlType }) => !sqlType.includes("with time zone"),
    );

    expect(withoutTimeZone).toEqual([]);
  });
});
