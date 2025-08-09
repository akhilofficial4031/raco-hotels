import { desc } from "drizzle-orm";
import { Hono } from "hono";

import { getDb } from "./db";
import { hotel } from "../drizzle/schema";

type Bindings = {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) =>
  c.json({ ok: true, service: "backend", framework: "hono" }),
);

app.get("/env", (c) => {
  const hasDB = Boolean(c.env.DB);
  const hasKV = Boolean(c.env.KV);
  const hasR2 = Boolean(c.env.R2_BUCKET);
  return c.json({ d1: hasDB, kv: hasKV, r2: hasR2 });
});

app.get("/hotels", async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(hotel).orderBy(desc(hotel.id));
  return c.json({ hotels: rows });
});

app.post("/hotels", async (c) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json<{ name?: string }>().catch(() => ({}));
  const name = (body.name ?? "New Hotel").trim();
  await db.insert(hotel).values({ name }).run();
  const [created] = await db
    .select()
    .from(hotel)
    .orderBy(desc(hotel.id))
    .limit(1);
  return c.json(created, 201);
});

// Mount API under /api for local proxy convenience
export default app.basePath("/");
