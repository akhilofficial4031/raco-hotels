# Environment & Configuration

## Versions

- Node.js 20+
- Yarn 4 (repo pins `yarn@4.6.0`)

## Ports

- Frontend (Vite): `5173`
- Backend (Wrangler): `8787`

## Vite proxy

`frontend/vite.config.ts` proxies `/api` to `http://127.0.0.1:8787` during development. This avoids CORS and simplifies local API calls.

## Cloudflare Wrangler

`backend/wrangler.toml` declares resource bindings:

- `[[d1_databases]]` → `DB`
- `[[kv_namespaces]]` → `KV`
- `[[r2_buckets]]` → `R2_BUCKET`

These are available in Hono handlers via `c.env.DB`, `c.env.KV`, and `c.env.R2_BUCKET`.

`[dev]` sets `persist = true` so local data is saved across restarts.

## TypeScript configs

Each workspace has its own `tsconfig.json` tuned for its runtime (browser vs Workers). The root ESLint config is aware of both TS projects for import resolution.
