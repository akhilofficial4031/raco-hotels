# Folder structure

High-level layout:

```text
raco-hotels/
  backend/
    drizzle/
      meta/
      0000_complex_scarecrow.sql
      schema.ts
    drizzle.config.ts
    package.json
    src/
      db.ts
      index.ts
    tsconfig.json
    wrangler.toml
  frontend/
    index.html
    package.json
    src/
      App.tsx
      main.tsx
    tsconfig.json
    vite.config.ts
  package.json
  yarn.lock
  README.md
  eslint.config.cjs
  commitlint.config.js
  raco-hotels.code-workspace
```

## Why this structure

- **Monorepo**: Keep `frontend` and `backend` in sync, share TypeScript config and linting rules, and run unified scripts.
- **Workspaces**: Each app (`frontend`, `backend`) has its own `package.json` and scripts to build, typecheck, and lint independently.
- **Infrastructure adjacent to code**: `wrangler.toml` and `drizzle` live under `backend/` so changes version together with code.

## What each part does

- `backend/`
  - `src/index.ts`: Hono application; defines routes like `/`, `/env`, and `/hotels`.
  - `src/db.ts`: Returns a typed Drizzle client bound to the Worker `D1Database`.
  - `drizzle/schema.ts`: Source-of-truth DB schema (Drizzle ORM). Migrations are generated from this.
  - `drizzle/`: Generated SQL migrations and Drizzle meta state.
  - `drizzle.config.ts`: Drizzle Kit configuration (schema path, output dir, dialect).
  - `wrangler.toml`: Cloudflare Workers local/prod configuration, including bindings for D1, KV, and R2.
  - `tsconfig.json`: TypeScript settings for the backend runtime.
  - `package.json`: Backend-only dependencies and scripts.

- `frontend/`
  - `src/main.tsx`: React bootstrap; mounts the app into `#root`.
  - `src/App.tsx`: Example application component.
  - `vite.config.ts`: Dev server settings and `/api` proxy to the backend.
  - `index.html`: Vite entry HTML.
  - `tsconfig.json`: TypeScript settings for the frontend.
  - `package.json`: Frontend-only dependencies and scripts.

- Root files
  - `package.json`: Yarn workspaces, shared scripts, and shared devDependencies.
  - `eslint.config.cjs`: Shared ESLint config for both apps (TypeScript, React, import order, Prettier).
  - `commitlint.config.js`: Conventional commits rules (types like `feat`, `fix`, `docs`, etc.).
  - `README.md`: Project-level readme.
  - `yarn.lock`: Locked dependency graph.
  - `raco-hotels.code-workspace`: VS Code multi-root workspace settings for better DX across `frontend` and `backend`.

This setup aims for clarity (clear app boundaries), speed (Vite and Workers), and safety (type-safe DB and linting).
