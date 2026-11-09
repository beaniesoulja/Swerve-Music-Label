import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// One client per process/isolate; the HTTP driver does not pool sockets.
let client: ReturnType<typeof createDb> | undefined;

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Configure the Neon Postgres connection in the server environment."
    );
  }

  return drizzle(neon(url), { schema });
}

export function getDb() {
  return (client ??= createDb());
}
