import * as z from "zod";

export const authIntentSchema = z.enum(["vote", "feedback", "board"]);
export const authReturnToSchema = z.string();

export type AuthIntent = z.infer<typeof authIntentSchema>;
