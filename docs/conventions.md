# Conventions (Style, Linting, Commits)

## ESLint + Prettier

- Shared config at the repo root: `eslint.config.cjs`.
- Rules include TypeScript, React, hooks, a11y, import order, and Prettier formatting.
- Run checks:

```bash
yarn lint
yarn format:check
```

- Auto-fix where possible:

```bash
yarn lint:fix
yarn format
```

## Commit messages (Conventional Commits)

Configured via `commitlint.config.js`. Use one of:

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `style`: formatting, missing semi-colons, etc.
- `refactor`: code change that neither fixes a bug nor adds a feature
- `perf`: performance improvements
- `test`: adding/adjusting tests
- `build`: build system or external dependencies
- `ci`: CI configuration changes
- `chore`: misc maintenance
- `revert`: revert a commit

Examples:

```
feat(backend): add GET /bookings endpoint
fix(frontend): handle empty hotels list gracefully
docs: document database migration workflow
```

## TypeScript

- Prefer explicit function signatures for exported functions.
- Keep types close to usage. Avoid `any`.
- Use early returns and handle error cases up-front.
