-- Delegram Platform DB
-- companies, users, billing, modules, auth

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'starter',
    status TEXT NOT NULL DEFAULT 'active',
    credits_remaining INTEGER NOT NULL DEFAULT 10,
    credits_used INTEGER NOT NULL DEFAULT 0,
    billing_cycle_start TIMESTAMPTZ,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    clerk_user_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'owner',
    auth_provider TEXT NOT NULL DEFAULT 'clerk',
    clerk_user_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, email)
);

CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, module_id)
);

INSERT INTO modules (code, name, description) VALUES
('site_builder', 'Site Builder', 'Pages, sites, templates, publishing'),
('crm', 'CRM', 'Contacts, deals, pipelines, kanban'),
('payments', 'Payments', 'Stripe checkout, subscriptions, invoices'),
('email', 'Email', 'Company mailboxes, outbound, support replies'),
('ads', 'Ads', 'Meta ads, creatives, budgets, tracking'),
('social', 'Social', 'Twitter and social account posting'),
('outreach', 'Outreach', 'Cold outreach campaigns and sequences'),
('ai_agents', 'AI Agents', 'Chat agents, tasks, agent runs'),
('documents', 'Documents', 'Content and document generation'),
('analytics', 'Analytics', 'Events, metrics, attribution'),
('scheduler', 'Scheduler', 'Task scheduling, jobs'),
('domains', 'Domains', 'Custom domains and subdomains')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_modules_company_id ON company_modules(company_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_company_modules_updated_at BEFORE UPDATE ON company_modules FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
