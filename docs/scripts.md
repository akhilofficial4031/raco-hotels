# Scripts

## Root `package.json`

- `dev`: runs frontend and backend concurrently
- `dev:frontend`: runs the frontend only
- `dev:backend`: runs the backend only
- `build`: runs build in each workspace
- `typecheck`: runs TypeScript checks in each workspace
- `lint` / `lint:fix`: lint across the repo
- `format` / `format:check`: Prettier formatting

Usage examples:

```bash
yarn dev
yarn build
yarn typecheck
```

## Backend `backend/package.json`

- `dev`: `wrangler dev --local`
- `build`: type-check (Workers bundles at deploy time)
- `typecheck`: TS only
- `db:generate`: generate SQL migrations from Drizzle schema
- `db:migrate:apply`: apply migrations to local D1
- `lint`, `lint:fix`, `format`, `format:check`

## Frontend `frontend/package.json`

- `dev`: run Vite dev server
- `build`: type-check then Vite build
- `preview`: preview build output locally
- `typecheck`: TS only
- `lint`, `lint:fix`, `format`, `format:check`
