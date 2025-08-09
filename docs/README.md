# Raco Hotels — Developer Documentation

Welcome to the Raco Hotels monorepo. This documentation explains the folder structure, technology choices, and day-to-day workflows so you can ship features quickly and safely.

## Architecture at a glance

- **Monorepo with Yarn Workspaces**: Single repository containing both `backend` and `frontend` with shared tooling and scripts.
- **Backend**: Cloudflare Workers + Hono for a fast, edge-friendly HTTP API. Data access via Drizzle ORM targeting Cloudflare D1 (SQLite).
- **Frontend**: React + TypeScript built with Vite. Local dev server proxies `/api` calls to the backend.

## Why this structure

- **Clear separation of concerns**: Independent `frontend` and `backend` packages for clean ownership and deployments.
- **Fast developer loop**: Vite provides instant HMR; Workers dev server is quick and predictable via Wrangler.
- **Type-safe data access**: Drizzle gives typed queries synced to schema.
- **Simple local stack**: D1, R2 and KV run locally via Wrangler with minimal setup.

## Quick start

Prerequisites:

- Node.js 20+
- Yarn 4 (this repo pins `"packageManager": "yarn@4.6.0"`)

Install dependencies once at the repo root:

```bash
yarn install
```

Run both apps in development:

```bash
yarn dev
# Frontend: http://localhost:5173
# Backend:  http://127.0.0.1:8787
```

Build all workspaces:

```bash
yarn build
```

Useful package-specific commands exist under each workspace; see Scripts.

## Learn more

- Folder structure: see `docs/folder-structure.md`
- Backend: see `docs/backend.md`
- Frontend: see `docs/frontend.md`
- Database & migrations: see `docs/database.md`
- Conventions (linting, formatting, commits): see `docs/conventions.md`
- Scripts (root, frontend, backend): see `docs/scripts.md`
- Environment & configuration: see `docs/environment.md`
- Adding features end-to-end: see `docs/adding-features.md`
- FAQ & common issues: see `docs/faq.md`
