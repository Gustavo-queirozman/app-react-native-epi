import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'gestao-epi.db';
let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async (database) => {
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS resource_cache (
          resource TEXT NOT NULL,
          resource_id TEXT NOT NULL,
          data TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (resource, resource_id)
        );
        CREATE INDEX IF NOT EXISTS resource_cache_lookup ON resource_cache(resource, updated_at DESC);
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY NOT NULL,
          method TEXT NOT NULL,
          path TEXT NOT NULL,
          body TEXT,
          created_at INTEGER NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT
        );
      `);
      return database;
    });
  }
  return databasePromise;
}
