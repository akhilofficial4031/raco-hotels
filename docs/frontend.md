# Frontend (React + Vite + TypeScript)

The frontend is a React application bootstrapped by Vite with TypeScript. Dev server proxies `/api` to the backend Worker.

## Key files

- `src/main.tsx`: Application bootstrap, mounts to `#root`.
- `src/App.tsx`: Example UI component.
- `vite.config.ts`: Dev server configuration and `/api` proxy to `http://127.0.0.1:8787`.
- `index.html`: HTML entrypoint containing the root element.

## Running locally

```bash
yarn dev:frontend
# http://localhost:5173
```

The proxy is configured so `fetch('/api/...')` during dev hits the backend without CORS issues.

## Calling the backend

```ts
async function loadHotels() {
  const res = await fetch('/api/hotels');
  const data = await res.json();
  return data.hotels;
}
```

## Building

```bash
yarn --cwd frontend build
```

## Why Vite + React

- **Fast HMR** and modern tooling for UI development.
- **TypeScript-first** setup for reliability.
- **Simple proxy** to the backend for a smooth local DX.
