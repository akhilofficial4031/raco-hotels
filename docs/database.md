# Database (Drizzle ORM + Cloudflare D1)

The backend uses Drizzle ORM with the SQLite dialect targeting Cloudflare D1. The schema lives in `backend/drizzle/schema.ts` and migrations are generated from it.

## Schema

Schema is authored in TypeScript and compiles to SQL migrations. Example from this repo:

```ts
export const hotel = sqliteTable('hotel', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
```

## Migrations workflow (local)

1. Edit schema in `backend/drizzle/schema.ts`.
2. Generate SQL migrations:

```bash
yarn --cwd backend db:generate
```

3. Apply migrations to the local D1 database:

```bash
yarn --cwd backend db:migrate:apply
```

`wrangler.toml` sets `migrations_dir = "drizzle"` so Wrangler knows where to find them.

## Querying from the Worker

Use `getDb(c.env.DB)` to obtain a typed Drizzle client and run queries.

```ts
const db = getDb(c.env.DB);
const hotels = await db.select().from(hotel);
```

## Why Drizzle + D1

- **Single source of truth**: schema in TypeScript; migrations generated consistently.
- **Type safety**: column types and query outputs are typed.
- **Local-first**: Wrangler runs D1 locally with persistence for fast iteration.

## Tips

- Keep changes atomic: update `schema.ts`, generate migration, and apply before writing route code.
- For production, use environment-specific D1 bindings and apply the same generated migrations as part of CI/CD.
