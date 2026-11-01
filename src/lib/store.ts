import { promises as fs } from "fs";
import path from "path";
import os from "os";
import type { DB } from "./types";

// Local dev keeps data in ./data/db.json. Serverless hosts (Vercel) only allow /tmp,
// so the demo resets when the instance recycles. Production would use Postgres.
const DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const FILE = path.join(DIR, "db.json");

const empty = (): DB => ({ leads: [], bookings: [], orders: [], events: [] });

let queue: Promise<unknown> = Promise.resolve();

export async function readDB(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
  } catch {
    return empty();
  }
}

async function writeDB(db: DB) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

// Serialize writes so two quick requests don't overwrite each other.
export function updateDB<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDB();
    const result = fn(db);
    await writeDB(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function resetDB() {
  await updateDB((db) => {
    db.leads = [];
    db.bookings = [];
    db.orders = [];
    db.events = [];
  });
}

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
