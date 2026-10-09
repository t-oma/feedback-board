import nextEnv from "@next/env";

import { parseTestEnvironment } from "./environment";

Object.assign(process.env, { NODE_ENV: "test" });
nextEnv.loadEnvConfig(process.cwd(), false);

export const testEnvironment = parseTestEnvironment(process.env);
