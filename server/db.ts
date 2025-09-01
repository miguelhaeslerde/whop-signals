import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, signals, signalReads, auditLogs } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, {
  schema: { users, signals, signalReads, auditLogs }
});