# Backend (Cloudflare Workers + Hono)

The backend is a Cloudflare Worker using the Hono framework with Drizzle ORM for data access to Cloudflare D1.

## Key files

- `src/index.ts`: Defines routes and binds to CF resources via `c.env`.
- `src/db.ts`: Exposes `getDb(d1)` to obtain a typed Drizzle client.
- `drizzle/schema.ts`: Drizzle schema for tables and columns.
- `wrangler.toml`: Local/prod bindings for D1 (`DB`), KV (`KV`), and R2 (`R2_BUCKET`).

## Running locally

```bash
yarn dev:backend
# Worker on http://127.0.0.1:8787
```

Wrangler is configured to persist local KV/R2/D1 storage (`persist = true`).

## Existing routes

- `GET /` → health check and metadata
- `GET /env` → shows whether DB, KV, and R2 are bound
- `GET /api/rooms/availability` → public room availability search
- `GET /api/rooms/{id}` → public room details
- `POST /api/booking/draft` → create draft booking (guest or logged-in)
- `POST /api/booking/{id}/payment` → process payment (auth required; mocked)
- `POST /api/booking/{id}/confirm` → confirm booking (auth required)
- `POST /api/booking/convert-draft` → convert guest draft to booking (auth required)

## Adding a route

1. Open `backend/src/index.ts`.
2. Add a new route using Hono:

```ts
app.get('/hello', (c) => c.text('Hello from Workers!'));
```

3. Restart or let Wrangler hot-reload: `yarn dev:backend`.

## Accessing the database

Use the injected D1 binding and Drizzle client.

```ts
app.get('/example', async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(hotel);
  return c.json(rows);
});
```

## Why Workers + Hono + Drizzle

- **Workers**: low-latency, globally distributed, simple deployment.
- **Hono**: tiny, fast, and great DX on Workers.
- **Drizzle**: type-safe SQL with first-class support for D1.

## Configuration

`wrangler.toml` binds local resources under the names `DB`, `KV`, and `R2_BUCKET`. These bindings are available at runtime via `c.env` in Hono handlers.
