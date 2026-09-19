import { getTableConfig, type PgTable } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { schema } from "./relations";

// This file sits beside `relations.ts` rather than in `schema/`, because
// `drizzle.config.ts` points `schema` at that directory and drizzle-kit loads
// every file it finds there. A test module among them breaks `db:generate`.

type SchemaColumn = {
  column: string;
  sqlType: string;
  hasSqlDefault: boolean;
};

const tables: PgTable[] = Object.values(schema);

const columns: SchemaColumn[] = tables.flatMap((table) => {
  const { name, columns } = getTableConfig(table);

  return columns.map((column) => ({
    column: `${name}.${column.name}`,
    sqlType: column.getSQLType(),
    // `hasDefault` is also set by `$onUpdate`, which writes nothing on insert,
    // so only an actual default value answers "can Postgres fill this in?".
    hasSqlDefault: column.default !== undefined,
  }));
});

const timestampColumns = columns.filter(({ sqlType }) =>
  sqlType.startsWith("timestamp"),
);

const rowLifecycleColumns = columns.filter(
  ({ column }) =>
    column.endsWith(".created_at") || column.endsWith(".updated_at"),
);

describe("schema timestamps", () => {
  it("finds the timestamp columns it is meant to guard", () => {
    expect(timestampColumns.length).toBeGreaterThan(0);
  });

  // A column without a time zone round-trips through the host's local zone:
  // Drizzle writes `Date#toISOString()`, and node-postgres reads the naked value
  // back as local time. The offset is invisible on a UTC host and wrong everywhere
  // else, so the type is an invariant of the schema rather than a per-table choice.
  it("declares every timestamp column with a time zone", () => {
    const withoutTimeZone = timestampColumns.filter(
      ({ sqlType }) => !sqlType.includes("with time zone"),
    );

    expect(withoutTimeZone).toEqual([]);
  });

  // Better Auth gives `session.updatedAt` and `account.updatedAt` an `onUpdate`
  // but no default, unlike `user` and `verification`. It always sends a value of
  // its own, so the gap only shows for a writer that is not Better Auth -- a seed
  // script, a data fix, a later admin tool -- which would hit a NOT NULL column
  // with nothing to put in it.
  it("lets Postgres fill in every created_at and updated_at", () => {
    const withoutSqlDefault = rowLifecycleColumns.filter(
      ({ hasSqlDefault }) => !hasSqlDefault,
    );

    expect(withoutSqlDefault).toEqual([]);
  });
});
