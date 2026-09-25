import "server-only";

import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { resolveDatabasePath } from "./database-path";
import * as schema from "./schema";

type Db = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const globalForDb = globalThis as unknown as { tosaveDb?: Db };

function createDb(): Db {
  const sqlite = new Database(resolveDatabasePath());
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

// Reaproveita a conexão entre recargas do dev server.
export const db = globalForDb.tosaveDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.tosaveDb = db;
}

export { schema };
