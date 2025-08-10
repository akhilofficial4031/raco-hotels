# Backend Scripts

This directory contains utility scripts for the Raco Hotels backend.

## Available Scripts

### `seed-admin.ts`

Seeds the database with an admin user for testing and development purposes.

#### Admin User Credentials

- **Email**: `admin@raco.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Status**: `active`

#### Usage

1. Make sure the database is set up and migrations are applied:

   ```bash
   npm run db:migrate:apply
   ```

2. Install dependencies (if not already done):

   ```bash
   yarn install
   ```

3. Run the seed script:
   ```bash
   yarn run db:seed:admin
   ```

#### Features

- Checks if admin user already exists to prevent duplicates
- Uses the same password hashing method as the production authentication system
- Provides clear output about the operation status
- Safe to run multiple times

#### Local Database Location

The script connects to the local Wrangler D1 database at:

```
.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local-db.sqlite
```

Make sure you have started the development server at least once before running the seed script to ensure the database file exists.

## Swagger UI Authentication

After seeding the admin user, you can use the credentials to test authenticated APIs in Swagger UI:

1. Go to `http://localhost:8787/docs` (or `/swagger-ui` or `/api-docs`)
2. Click the "Authorize" button in the top right
3. Use the login endpoint (`POST /auth/login`) with:
   - Email: `admin@raco.com`
   - Password: `admin123`
4. Copy the `csrfToken` from the response
5. Use the "Authorize" button to set up authentication:
   - For Bearer Token: You can extract the JWT from the response cookies
   - For CSRF Token: Paste the `csrfToken` value

This allows you to test all protected endpoints directly from the Swagger UI.
