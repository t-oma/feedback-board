# Auth E2E tests

The browser suite uses the existing local PostgreSQL container but a separate database named `feedback_board_test`.

Create that database once:

```bash
docker compose exec postgres sh -c 'createdb --username "$POSTGRES_USER" feedback_board_test'
```

Copy the test environment template and replace its PostgreSQL credentials:

```bash
cp .env.test.example .env.test.local
openssl rand -base64 32
```

Put the generated value in `BETTER_AUTH_SECRET`. Keep `.env.test.local` untracked.

Install Chromium once, then run the suite:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

The runner refuses to start unless both database URLs point to `feedback_board_test`. It applies migrations but does not create, reset, truncate, or drop the database.

The Playwright server uses `.next-e2e`, so it can run while the regular development server is active on port `3000`.

## Database tests

`pnpm test:db` runs the Vitest tests that need PostgreSQL, the `*.db.test.ts` files, against the same `feedback_board_test` database. It loads the environment from the same files, refuses the same wrong URLs, and applies migrations through the same global setup, all of which live in `test/`. Like the browser suite, it never resets the database: each test creates its own users and slugs. `pnpm test` leaves these tests out, so it still runs without a database.
