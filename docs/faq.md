# FAQ & Troubleshooting

## Frontend shows a blank page

Ensure `index.html` contains `<div id="root"></div>` and that `src/main.tsx` can find it. Restart Vite: `yarn dev:frontend`.

## API calls fail with CORS errors

Use the `/api` prefix during development so the Vite proxy forwards to the backend (`vite.config.ts`). Example: `fetch('/api/hotels')`.

## Ports are in use

- Frontend default: `5173`
- Backend default: `8787`

Change in `frontend/vite.config.ts` or `backend/wrangler.toml`.

## Migrations generated but no data changes

After `db:generate`, you must apply them locally:

```bash
yarn --cwd backend db:migrate:apply
```

## TypeScript complains about missing globals in the backend

The ESLint/TS config declares Worker globals (e.g., `D1Database`, `KVNamespace`). Ensure you're editing files under `backend/` and that the backend tsconfig is used.

## How do I reset local D1 data?

With `persist = true`, Wrangler stores local state on disk. Stop the dev server and remove the local persistence directory under `.wrangler/` for a clean slate (only do this if you understand the impact).
