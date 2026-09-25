import { mkdirSync } from "node:fs";
import path from "node:path";

export const DEFAULT_DATABASE_URL = "file:./data/tosave.db";

/**
 * Converte DATABASE_URL (aceita "file:./caminho.db" ou apenas "./caminho.db")
 * em caminho absoluto e garante que a pasta do arquivo exista.
 */
export function resolveDatabasePath(
  url: string = process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
): string {
  const filePath = path.resolve(process.cwd(), url.replace(/^file:/, ""));
  mkdirSync(path.dirname(filePath), { recursive: true });
  return filePath;
}
