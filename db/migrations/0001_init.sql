-- NDF revival website. Migration 0001: the 13 Phase 1 tables (brief section 11.1).
-- Applied by apps/web/scripts/migrate.mjs, which asserts the table count afterwards.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1. users (admins and editors)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin','editor')),
  token_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  phase TEXT NOT NULL DEFAULT 'P1',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. page_translations
CREATE TABLE IF NOT EXISTS page_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en','si','ta')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','reviewed','published')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  UNIQUE (page_id, locale)
);

-- 4. programmes
CREATE TABLE IF NOT EXISTS programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  period TEXT,
  funder TEXT,
  status TEXT NOT NULL DEFAULT 'records' CHECK (status IN ('evidence','records','reported')),
  source_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. programme_translations
CREATE TABLE IF NOT EXISTS programme_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en','si','ta')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','reviewed','published')),
  UNIQUE (programme_id, locale)
);

-- 6. documents (public tier of the corpus manifest only)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,                       -- doc_id such as NDF-FND-001
  collection TEXT NOT NULL CHECK (collection = 'ndf_core'),
  sensitivity TEXT NOT NULL CHECK (sensitivity = 'public'),
  status TEXT NOT NULL DEFAULT 'canonical' CHECK (status IN ('canonical','withdrawn')),
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  language TEXT NOT NULL,
  date_label TEXT,
  year INT,
  pages INT,
  summary TEXT,
  notes TEXT,
  text_quality TEXT,
  text_source TEXT,
  source_credit TEXT,
  licence TEXT,
  original_url TEXT,          -- hosted original (public records only)
  external_url TEXT,          -- publisher link (copyright material)
  programme_slugs TEXT[] NOT NULL DEFAULT '{}',
  body_text TEXT,             -- full text sidecar
  tsv TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(summary,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(body_text,'')), 'C')
  ) STORED,
  sha256 TEXT,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS documents_tsv_idx ON documents USING GIN (tsv);

-- 7. document_chunks (text and vector, for Phase 3)
CREATE TABLE IF NOT EXISTS document_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page INT,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  UNIQUE (document_id, chunk_index)
);

-- 8. newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  interests TEXT[] NOT NULL DEFAULT '{}',
  consent_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirm_token TEXT UNIQUE,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. contact_messages (contact, get-involved and records-offer forms)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'contact' CHECK (kind IN ('contact','former_staff','community','partner','researcher','volunteer','donor','records_offer','memory')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  place TEXT,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  attachment_path TEXT,
  attachment_name TEXT,
  attachment_bytes INT,
  consent_version TEXT NOT NULL,
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','answered','archived','spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);

-- 10. donations (Phase 2, table only)
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL,
  purpose TEXT,
  donor_name TEXT,
  donor_email TEXT,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. donation_events
CREATE TABLE IF NOT EXISTS donation_events (
  id BIGSERIAL PRIMARY KEY,
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. ask_logs (Phase 3)
CREATE TABLE IF NOT EXISTS ask_logs (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  cited_ids TEXT[] NOT NULL DEFAULT '{}',
  latency_ms INT,
  refused BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT,
  action TEXT NOT NULL,
  target TEXT,
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site settings live in audit-free key/value form inside pages? No: keep a single legal status row in audit_log-free table would be a 14th table.
-- The legal standing state is stored on the 'about/legal' page row via a JSON column to stay at 13 tables.
ALTER TABLE pages ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;
