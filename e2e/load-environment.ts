import nextEnv from "@next/env";
import { parseE2EEnvironment } from "./environment";

Object.assign(process.env, { NODE_ENV: "test" });
nextEnv.loadEnvConfig(process.cwd(), false);

export const e2eEnvironment = parseE2EEnvironment(process.env);
