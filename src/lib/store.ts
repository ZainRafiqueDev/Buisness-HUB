import { promises as fs } from "fs";
import path from "path";
import os from "os";
import type { DB } from "./types";

// Local dev keeps data in ./data/<business>.json. Serverless hosts (Vercel) only allow /tmp,
// so data resets when the instance recycles. Production would use Postgres.
const DIR = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "data");
const file = (biz: string) => path.join(DIR, `${biz.replace(/[^a-z0-9-]/g, "")}.json`);

export const emptyDB = (): DB => ({
  leads: [],
  bookings: [],
  orders: [],
  checkouts: [],
  events: [],
  disabled: [],
  clockDays: 0,
});

let queue: Promise<unknown> = Promise.resolve();

export async function readDB(biz: string): Promise<DB> {
  try {
    return { ...emptyDB(), ...(JSON.parse(await fs.readFile(file(biz), "utf8")) as DB) };
  } catch {
    return emptyDB();
  }
}

export async function hasDB(biz: string) {
  return fs.access(file(biz)).then(
    () => true,
    () => false,
  );
}

// Serialize writes so two quick requests don't overwrite each other.
export function updateDB<T>(biz: string, fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDB(biz);
    const result = fn(db);
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(file(biz), JSON.stringify(db, null, 2));
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// The CRM can "skip ahead" in time so scheduled emails visibly send during a walkthrough.
export const nowMs = (db: DB) => Date.now() + db.clockDays * 86_400_000;
export const nowIso = (db: DB) => new Date(nowMs(db)).toISOString();
