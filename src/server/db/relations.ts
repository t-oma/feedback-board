import { defineRelationsPart } from "drizzle-orm";
import {
  accounts,
  authRelations,
  sessions,
  users,
  verifications,
} from "./schema/auth";

export const schema = {
  users,
  sessions,
  accounts,
  verifications,
};

/**
 * If we want to have relations as parts only,
 * then one of parts should be empty and have schema with all tables,
 * so drizzle can infer all of the table for autocomplete
 *
 * @see https://orm.drizzle.team/docs/relations#relations-parts
 */
const mainPart = defineRelationsPart(schema);

export const relations = { ...mainPart, ...authRelations };
