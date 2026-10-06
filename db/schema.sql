-- Atlas masters (continents → countries → universities) and the admin activity log.
-- Idempotent: runs on first container start and again from scripts/db-seed.mjs.

CREATE TABLE IF NOT EXISTS continents (
  id          text PRIMARY KEY,                -- slug used in URLs, e.g. 'middle-east'
  name        text NOT NULL,
  tagline     text NOT NULL DEFAULT '',
  image_url   text NOT NULL DEFAULT '',
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS continents_name_key ON continents (lower(name));

CREATE TABLE IF NOT EXISTS countries (
  id            serial PRIMARY KEY,
  continent_id  text NOT NULL REFERENCES continents (id) ON DELETE CASCADE ON UPDATE CASCADE,
  name          text NOT NULL,
  cost          text,                            -- optional tuition note
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
-- Country names are unique across the atlas because the public directory filters by name
CREATE UNIQUE INDEX IF NOT EXISTS countries_name_key ON countries (lower(name));
CREATE INDEX IF NOT EXISTS countries_continent_idx ON countries (continent_id);

CREATE TABLE IF NOT EXISTS universities (
  id          serial PRIMARY KEY,
  country_id  integer NOT NULL REFERENCES countries (id) ON DELETE CASCADE,
  name        text NOT NULL,
  logo        text,
  website     text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS universities_country_name_key ON universities (country_id, lower(name));

-- A continent's top 5 for the landing page; referencing ids keeps it correct through renames and deletes
CREATE TABLE IF NOT EXISTS continent_top (
  continent_id   text NOT NULL REFERENCES continents (id) ON DELETE CASCADE ON UPDATE CASCADE,
  position       smallint NOT NULL CHECK (position BETWEEN 1 AND 5),
  university_id  integer NOT NULL REFERENCES universities (id) ON DELETE CASCADE,
  PRIMARY KEY (continent_id, position),
  UNIQUE (continent_id, university_id)
);

-- Every admin change, kept for the Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id           bigserial PRIMARY KEY,
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  actor        text NOT NULL,
  action       text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'seed')),
  entity       text NOT NULL CHECK (entity IN ('continent', 'country', 'university', 'atlas')),
  entity_id    text,
  summary      text NOT NULL,
  changes      jsonb                            -- updates: {field: {from, to}}; create/delete: the record
);
CREATE INDEX IF NOT EXISTS activity_log_occurred_at_idx ON activity_log (occurred_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON activity_log (entity, occurred_at DESC);

-- Images uploaded in admin (university logos), served by /api/uploads/<id>
CREATE TABLE IF NOT EXISTS uploads (
  id             serial PRIMARY KEY,
  content_type   text NOT NULL CHECK (content_type IN ('image/png', 'image/jpeg', 'image/webp', 'image/gif')),
  data           bytea NOT NULL,
  byte_size      integer NOT NULL,
  original_name  text,
  uploaded_by    text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
