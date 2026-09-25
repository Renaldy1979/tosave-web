import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

import { resolveDatabasePath } from "./src/db/database-path";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: resolveDatabasePath(),
  },
  strict: true,
  verbose: true,
});
