CREATE TABLE IF NOT EXISTS crm_users (
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'osai_admin', 'client', 'collaborator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE crm_users DROP CONSTRAINT IF EXISTS crm_users_role_check;
ALTER TABLE crm_users ALTER COLUMN role SET DEFAULT 'client';
UPDATE crm_users SET role = 'client' WHERE role = 'member';
ALTER TABLE crm_users ADD CONSTRAINT crm_users_role_check CHECK (role IN ('admin', 'osai_admin', 'client', 'collaborator'));

CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'complete', 'archived')),
  created_by TEXT NOT NULL REFERENCES crm_users(clerk_user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_user_access (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL REFERENCES crm_users(clerk_user_id) ON DELETE CASCADE,
  access_scope TEXT NOT NULL DEFAULT 'entire_project' CHECK (access_scope IN ('entire_project', 'selected_parts')),
  project_parts TEXT[] NOT NULL DEFAULT '{}',
  assigned_by TEXT NOT NULL REFERENCES crm_users(clerk_user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, clerk_user_id)
);

CREATE TABLE IF NOT EXISTS industry_verticals (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_categories (
  id BIGSERIAL PRIMARY KEY,
  industry_vertical_id BIGINT NOT NULL REFERENCES industry_verticals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (industry_vertical_id, name)
);

CREATE TABLE IF NOT EXISTS client_subcategories (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES client_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, name)
);

CREATE TABLE IF NOT EXISTS companies (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  subcategory_id BIGINT REFERENCES client_subcategories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'active', 'inactive')),
  relationship_owner_id TEXT REFERENCES crm_users(clerk_user_id) ON DELETE SET NULL,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES crm_users(clerk_user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job_title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by TEXT NOT NULL REFERENCES crm_users(clerk_user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE companies ADD COLUMN IF NOT EXISTS subcategory_id BIGINT REFERENCES client_subcategories(id) ON DELETE SET NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'prospect';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS relationship_owner_id TEXT REFERENCES crm_users(clerk_user_id) ON DELETE SET NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS opportunities (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stage TEXT NOT NULL,
  value_cents BIGINT NOT NULL DEFAULT 0,
  owner_id TEXT NOT NULL REFERENCES crm_users(clerk_user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contacts_company_id_idx ON contacts(company_id);
CREATE INDEX IF NOT EXISTS crm_users_role_idx ON crm_users(role);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS project_user_access_user_id_idx ON project_user_access(clerk_user_id);
CREATE INDEX IF NOT EXISTS project_user_access_project_id_idx ON project_user_access(project_id);
CREATE UNIQUE INDEX IF NOT EXISTS contacts_one_primary_per_company_idx ON contacts(company_id) WHERE is_primary;
CREATE INDEX IF NOT EXISTS client_categories_vertical_id_idx ON client_categories(industry_vertical_id);
CREATE INDEX IF NOT EXISTS client_subcategories_category_id_idx ON client_subcategories(category_id);
CREATE INDEX IF NOT EXISTS companies_subcategory_id_idx ON companies(subcategory_id);
CREATE INDEX IF NOT EXISTS companies_relationship_owner_id_idx ON companies(relationship_owner_id);
CREATE INDEX IF NOT EXISTS companies_status_idx ON companies(status);
CREATE UNIQUE INDEX IF NOT EXISTS companies_name_ci_idx ON companies(LOWER(name));
CREATE INDEX IF NOT EXISTS opportunities_company_id_idx ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS opportunities_owner_id_idx ON opportunities(owner_id);

-- Shared workspace content. Clerk user IDs are stored as audit identifiers rather
-- than foreign keys because Clerk is the source of truth for authenticated users.
CREATE TABLE IF NOT EXISTS calendar_events (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'Not Contacted',
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  related_to TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  brief TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_products (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  includes TEXT[] NOT NULL DEFAULT '{}',
  format TEXT NOT NULL DEFAULT '',
  investment TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (service_id, name)
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Planning',
  brief TEXT NOT NULL,
  description TEXT NOT NULL,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON calendar_events(event_date, event_time);
CREATE INDEX IF NOT EXISTS calendar_events_related_idx ON calendar_events(LOWER(related_to));
CREATE UNIQUE INDEX IF NOT EXISTS calendar_events_import_dedupe_idx ON calendar_events(title, event_date, COALESCE(event_time, '00:00'::time), LOWER(related_to));
CREATE INDEX IF NOT EXISTS service_products_service_position_idx ON service_products(service_id, position, id);
CREATE INDEX IF NOT EXISTS campaigns_updated_at_idx ON campaigns(updated_at DESC);

CREATE TABLE IF NOT EXISTS workspace_imports (
  import_key TEXT PRIMARY KEY,
  imported_by TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
