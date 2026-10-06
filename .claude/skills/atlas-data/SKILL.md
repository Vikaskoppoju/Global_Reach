---
name: atlas-data
description: How GlobalReach's atlas data (continents, countries, universities, top 5, logos) flows between PostgreSQL in development and the static JSON snapshot used in production. Use before changing anything that reads or writes atlas data, the admin masters, the db/ or scripts/db-* files, lib/*.json snapshots, or the build/deploy setup.
---

# Atlas data: database in dev, static snapshot in prod

The atlas is the continents → countries → universities data behind the landing page, the
`/universities` directory and the admin **Masters**. It exists in two places:

| | PostgreSQL (Docker) | Static snapshot |
|---|---|---|
| Files | `docker-compose.yml`, `db/schema.sql` | `lib/continent-meta.json`, `lib/world-universities.json`, `lib/country-costs.json`, `public/logos/` |
| Used when | `next dev` (default) | `next build` / `next start` (default), or whenever the database is unreachable |
| Editable | Yes, in `/admin` → Masters (every change is written to `activity_log`) | No, read-only |

**The database is the source of truth.** The snapshot is generated from it.

## How the mode is chosen

- `next.config.mjs` sets `NEXT_PUBLIC_ATLAS_SOURCE`:
  - `ATLAS_SOURCE` env var if set (`db` or `static`)
  - otherwise `db` for `next dev`, `static` for `next build`
- Read it through `ATLAS_SOURCE` in `lib/atlas-source.ts`. Never check `NODE_ENV` directly for this.
- **db mode:** `useAtlas()` / `useAtlasState()` (`lib/atlas.ts`) render the snapshot first, then load
  `/api/atlas`. If that fails, they keep the snapshot and report `source: 'fallback'`. The admin
  masters then show a warning and become read-only.
- **static mode:**
  - No request is made.
  - `/api/atlas` serves the snapshot.
  - Every admin write route uses `handleWrite` (`lib/server/api.ts`) and returns 409.
  - The masters show a read-only notice.

## Workflow

```bash
npm run db:up        # start PostgreSQL (localhost:5433, data kept in the globalreach-pgdata volume)
npm run db:seed      # first time only: load the snapshot into an empty database
npm run dev          # edit in /admin → Masters (demo login: admin@globalreach.org / admin123)
npm run db:export    # write the database back into the snapshot (+ uploaded logos to public/logos/uploads)
npm run build        # prebuild runs db:export automatically when the database is up
```

Commit the updated snapshot files together with code changes. They are what production serves.

- `npm run build` runs `db-export --if-available` first.
  - Database down: it warns and builds with the snapshot already in `lib/`.
  - Database empty: it refuses to overwrite the snapshot.
- Uploaded logos are stored in the `uploads` table and served from `/api/uploads/<id>` in dev.
  The export copies them to `public/logos/uploads/<id>.<ext>` and rewrites the paths, so production
  needs no database.

## Rules

- **Never hand-edit the snapshot JSON** while the database is in use. Change data in the admin (or in
  SQL), then run `npm run db:export`. Hand edits are overwritten by the next export or build.
- **Re-importing the spreadsheet** (`World_Universities_International_Students.xlsx`):
  1. `python scripts/build-universities.py`
  2. `npm run db:seed -- --force` (wipes the masters, keeps `activity_log`)
  3. `npm run db:export`
- **Schema changes go in `db/schema.sql`** and must stay idempotent (`IF NOT EXISTS`). It runs on a
  fresh container and on every `db:seed`. Apply it to a running database with:
  `docker exec -i globalreach-db psql -U globalreach -d globalreach < db/schema.sql`
- **Every master change goes through `lib/server/atlas-repo.ts`.** It runs inside `withTransaction` and
  calls `log()`, so the change and its `activity_log` row commit together. Don't write atlas tables
  from anywhere else.
- **New fields** need to be added in all of these places:
  1. `db/schema.sql`
  2. `atlas-repo.ts` (`getAtlas` plus the create/update/diff)
  3. `types/index.ts`
  4. `scripts/db-export.mjs`
  5. `scripts/db-seed.mjs`

  Otherwise the dev and prod data drift apart.
- Keep `id`s optional in `types/index.ts`. The snapshot has no database ids, and code that needs ids
  (admin editing) must only run when `source === 'db'`.

## Known gaps

- The admin login is the hard-coded demo in `context/AuthContext.tsx`. The `/api/admin/*` routes are
  not authenticated, and the actor in `activity_log` is the unverified `x-admin-user` header.
  Don't expose db mode publicly until real auth exists.
- Database credentials in `docker-compose.yml` / `.env.local` are for local development only.
