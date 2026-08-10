CREATE TABLE IF NOT EXISTS crm_users (
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
CREATE UNIQUE INDEX IF NOT EXISTS contacts_one_primary_per_company_idx ON contacts(company_id) WHERE is_primary;
CREATE INDEX IF NOT EXISTS client_categories_vertical_id_idx ON client_categories(industry_vertical_id);
CREATE INDEX IF NOT EXISTS client_subcategories_category_id_idx ON client_subcategories(category_id);
CREATE INDEX IF NOT EXISTS companies_subcategory_id_idx ON companies(subcategory_id);
CREATE INDEX IF NOT EXISTS companies_relationship_owner_id_idx ON companies(relationship_owner_id);
CREATE INDEX IF NOT EXISTS companies_status_idx ON companies(status);
CREATE UNIQUE INDEX IF NOT EXISTS companies_name_ci_idx ON companies(LOWER(name));
CREATE INDEX IF NOT EXISTS opportunities_company_id_idx ON opportunities(company_id);
CREATE INDEX IF NOT EXISTS opportunities_owner_id_idx ON opportunities(owner_id);
