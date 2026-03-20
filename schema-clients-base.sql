-- Polsia Core Backend Schema
-- PostgreSQL
-- Multi-tenant, modular, copy-pasteable starter schema

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- 1. CORE TENANCY / AUTH
-- =========================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'starter',
    status TEXT NOT NULL DEFAULT 'active',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    auth_provider TEXT NOT NULL DEFAULT 'password',
    password_hash TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, email)
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 2. MODULES / FEATURE FLAGS
-- =========================================================

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE company_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, module_id)
);

-- Seed common modules
INSERT INTO modules (code, name, description) VALUES
('site_builder', 'Site Builder', 'Pages, sites, templates, publishing'),
('crm', 'CRM', 'Contacts, deals, pipelines, kanban'),
('payments', 'Payments', 'Stripe checkout, subscriptions, invoices'),
('email', 'Email', 'Company mailboxes, outbound, support replies'),
('ads', 'Ads', 'Meta ads, creatives, budgets, tracking'),
('social', 'Social', 'Twitter and social account posting'),
('ugc_video', 'UGC Video', 'Ad video and asset generation'),
('outreach', 'Outreach', 'Cold outreach campaigns and sequences'),
('browser_automation', 'Browser Automation', 'Automated browser sessions'),
('ai_agents', 'AI Agents', 'Chat agents, tasks, agent runs'),
('documents', 'Documents', 'Content and document generation'),
('analytics', 'Analytics', 'Events, metrics, attribution'),
('scheduler', 'Scheduler', 'Task scheduling, night shifts, jobs'),
('domains', 'Domains', 'Custom domains and subdomains')
ON CONFLICT (code) DO NOTHING;

-- =========================================================
-- 3. DOMAINS / SITE BUILDER
-- =========================================================

CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    hostname TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    provider TEXT,
    ssl_status TEXT NOT NULL DEFAULT 'pending',
    verification_status TEXT NOT NULL DEFAULT 'pending',
    dns_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (hostname)
);

CREATE TABLE dns_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    host TEXT NOT NULL,
    value TEXT NOT NULL,
    ttl INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    theme JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, slug)
);

CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    parent_page_id UUID REFERENCES pages(id) ON DELETE SET NULL,
    slug TEXT NOT NULL,
    path TEXT NOT NULL,
    title TEXT NOT NULL,
    page_type TEXT NOT NULL DEFAULT 'standard',
    status TEXT NOT NULL DEFAULT 'draft',
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_homepage BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (site_id, path)
);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    storage_url TEXT NOT NULL,
    size_bytes BIGINT,
    width INTEGER,
    height INTEGER,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 4. CRM / PIPELINE / KANBAN
-- =========================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    website TEXT,
    source TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, name)
);

CREATE TABLE pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    sort_order INTEGER NOT NULL,
    win_probability NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (pipeline_id, name),
    UNIQUE (pipeline_id, sort_order)
);

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE RESTRICT,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    value_amount NUMERIC(18,2),
    value_currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'open',
    expected_close_date DATE,
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    won_at TIMESTAMPTZ,
    lost_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contact_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL,
    subject TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- 5. PAYMENTS / STRIPE
-- =========================================================

CREATE TABLE payment_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'stripe',
    external_customer_id TEXT NOT NULL,
    email TEXT,
    name TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, external_customer_id)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    product_type TEXT NOT NULL DEFAULT 'one_time',
    active BOOLEAN NOT NULL DEFAULT true,
    provider_product_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    currency TEXT NOT NULL DEFAULT 'USD',
    unit_amount NUMERIC(18,2) NOT NULL,
    billing_interval TEXT,
    provider_price_id TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'stripe',
    external_checkout_id TEXT,
    status TEXT NOT NULL DEFAULT 'created',
    success_url TEXT,
    cancel_url TEXT,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    amount_total NUMERIC(18,2),
    currency TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payment_customer_id UUID REFERENCES payment_customers(id) ON DELETE SET NULL,
    checkout_id UUID REFERENCES checkouts(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'stripe',
    external_payment_id TEXT,
    amount NUMERIC(18,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL,
    payment_method_type TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, external_payment_id)
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payment_customer_id UUID REFERENCES payment_customers(id) ON DELETE SET NULL,
    provider TEXT NOT NULL DEFAULT 'stripe',
    external_subscription_id TEXT NOT NULL,
    price_id UUID REFERENCES prices(id) ON DELETE SET NULL,
    status TEXT NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, external_subscription_id)
);

-- =========================================================
-- 6. EMAIL / SUPPORT / OUTBOUND
-- =========================================================

CREATE TABLE email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    provider TEXT NOT NULL,
    display_name TEXT,
    encrypted_credentials JSONB,
    smtp_config JSONB,
    imap_config JSONB,
    support_inbox BOOLEAN NOT NULL DEFAULT false,
    outbound_enabled BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'connected',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (address)
);

CREATE TABLE email_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
    subject TEXT,
    external_thread_id TEXT,
    direction TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    labels JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES email_threads(id) ON DELETE CASCADE,
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    direction TEXT NOT NULL,
    message_id_header TEXT,
    in_reply_to_header TEXT,
    from_address TEXT,
    to_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
    cc_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
    bcc_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, name)
);

CREATE TABLE support_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email_account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    action_type TEXT NOT NULL,
    action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 7. ADS / META / CREATIVE / BUDGETS
-- =========================================================

CREATE TABLE ad_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_account_id TEXT NOT NULL,
    account_name TEXT,
    currency TEXT DEFAULT 'USD',
    timezone TEXT,
    encrypted_credentials JSONB,
    status TEXT NOT NULL DEFAULT 'connected',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (platform, external_account_id)
);

CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ad_account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    objective TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    daily_budget NUMERIC(18,2),
    lifetime_budget NUMERIC(18,2),
    currency TEXT DEFAULT 'USD',
    targeting JSONB NOT NULL DEFAULT '{}'::jsonb,
    external_campaign_id TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (ad_account_id, external_campaign_id)
);

CREATE TABLE ad_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    budget NUMERIC(18,2),
    bidding_strategy TEXT,
    targeting JSONB NOT NULL DEFAULT '{}'::jsonb,
    external_ad_set_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (campaign_id, external_ad_set_id)
);

CREATE TABLE creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    creative_type TEXT NOT NULL,
    title TEXT,
    body TEXT,
    asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    video_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    thumbnail_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_set_id UUID NOT NULL REFERENCES ad_sets(id) ON DELETE CASCADE,
    creative_id UUID REFERENCES creatives(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    destination_url TEXT,
    external_ad_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (ad_set_id, external_ad_id)
);

CREATE TABLE ad_metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ad_account_id UUID REFERENCES ad_accounts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    ad_set_id UUID REFERENCES ad_sets(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    ctr NUMERIC(10,4),
    spend NUMERIC(18,2) NOT NULL DEFAULT 0,
    conversions NUMERIC(18,2) NOT NULL DEFAULT 0,
    revenue NUMERIC(18,2) NOT NULL DEFAULT 0,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (ad_id, metric_date)
);

-- =========================================================
-- 8. UGC / VIDEO GENERATION
-- =========================================================

CREATE TABLE video_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    prompt TEXT,
    script_text TEXT,
    aspect_ratio TEXT,
    output_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE video_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL,
    scene_title TEXT,
    scene_prompt TEXT,
    narration_text TEXT,
    duration_seconds INTEGER,
    asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (video_project_id, sort_order)
);

-- =========================================================
-- 9. SOCIAL / TWITTER
-- =========================================================

CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    handle TEXT,
    external_account_id TEXT,
    encrypted_credentials JSONB,
    status TEXT NOT NULL DEFAULT 'connected',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (platform, external_account_id)
);

CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    media_assets JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    external_post_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE social_post_metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    impressions BIGINT NOT NULL DEFAULT 0,
    engagements BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    likes BIGINT NOT NULL DEFAULT 0,
    shares BIGINT NOT NULL DEFAULT 0,
    comments BIGINT NOT NULL DEFAULT 0,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (social_post_id, metric_date)
);

-- =========================================================
-- 10. COLD OUTREACH
-- =========================================================

CREATE TABLE outreach_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    status TEXT NOT NULL DEFAULT 'draft',
    from_email_account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outreach_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type TEXT NOT NULL,
    subject_template TEXT,
    body_template TEXT,
    delay_hours INTEGER NOT NULL DEFAULT 0,
    action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (campaign_id, step_order)
);

CREATE TABLE outreach_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    current_step_order INTEGER NOT NULL DEFAULT 0,
    last_contacted_at TIMESTAMPTZ,
    next_action_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (campaign_id, contact_id)
);

CREATE TABLE outreach_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
    outreach_target_id UUID REFERENCES outreach_targets(id) ON DELETE CASCADE,
    outreach_step_id UUID REFERENCES outreach_steps(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 11. BROWSER AUTOMATION
-- =========================================================

CREATE TABLE browser_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_type TEXT NOT NULL DEFAULT 'automation',
    status TEXT NOT NULL DEFAULT 'created',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE browser_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    browser_session_id UUID NOT NULL REFERENCES browser_sessions(id) ON DELETE CASCADE,
    action_order INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    output JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (browser_session_id, action_order)
);

-- =========================================================
-- 12. AI AGENTS / CHAT / RUNS
-- =========================================================

CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    model TEXT,
    system_prompt TEXT,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'web_chat',
    status TEXT NOT NULL DEFAULT 'open',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,
    sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    body_text TEXT,
    body_json JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    trigger_type TEXT NOT NULL,
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    output JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'queued',
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 13. DOCUMENTS / CONTENT GENERATION
-- =========================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    content_text TEXT,
    content_json JSONB,
    source_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content_text TEXT,
    content_json JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (document_id, version_number)
);

-- =========================================================
-- 14. ANALYTICS / EVENTS / METRICS
-- =========================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    source TEXT,
    entity_type TEXT,
    entity_id UUID,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_date DATE NOT NULL,
    dimension JSONB NOT NULL DEFAULT '{}'::jsonb,
    metric_value NUMERIC(18,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, metric_name, metric_date, dimension)
);

CREATE TABLE attribution_touches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    source TEXT,
    medium TEXT,
    campaign TEXT,
    content TEXT,
    term TEXT,
    landing_page TEXT,
    referrer TEXT,
    touched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 15. TASK SCHEDULING / NIGHT SHIFTS / JOBS
-- =========================================================

CREATE TABLE task_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    queue_type TEXT NOT NULL DEFAULT 'default',
    concurrency_limit INTEGER NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, name)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    queue_id UUID REFERENCES task_queues(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    priority INTEGER NOT NULL DEFAULT 100,
    scheduled_for TIMESTAMPTZ,
    cron_expression TEXT,
    timezone TEXT,
    night_shift_only BOOLEAN NOT NULL DEFAULT false,
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    output JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    run_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'running',
    worker_name TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_message TEXT,
    UNIQUE (task_id, run_number)
);

-- =========================================================
-- 16. DOMAIN ROUTING / CUSTOM SUBDOMAINS
-- =========================================================

CREATE TABLE subdomain_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    subdomain TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (subdomain)
);

-- =========================================================
-- 17. EXECUTION / AUDIT / ACTION LOG
-- =========================================================

CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    status TEXT NOT NULL DEFAULT 'started',
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    output JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    event_type TEXT,
    delivery_id TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'received',
    error_message TEXT
);

-- =========================================================
-- 18. INDEXES
-- =========================================================

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_domains_company_id ON domains(company_id);
CREATE INDEX idx_sites_company_id ON sites(company_id);
CREATE INDEX idx_pages_site_id ON pages(site_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_notes_company_id ON notes(company_id);
CREATE INDEX idx_contact_activities_company_id ON contact_activities(company_id);
CREATE INDEX idx_payment_customers_company_id ON payment_customers(company_id);
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_email_accounts_company_id ON email_accounts(company_id);
CREATE INDEX idx_email_threads_company_id ON email_threads(company_id);
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_ad_accounts_company_id ON ad_accounts(company_id);
CREATE INDEX idx_ad_campaigns_company_id ON ad_campaigns(company_id);
CREATE INDEX idx_ad_metrics_daily_company_id_date ON ad_metrics_daily(company_id, metric_date);
CREATE INDEX idx_video_projects_company_id ON video_projects(company_id);
CREATE INDEX idx_social_accounts_company_id ON social_accounts(company_id);
CREATE INDEX idx_social_posts_company_id ON social_posts(company_id);
CREATE INDEX idx_outreach_campaigns_company_id ON outreach_campaigns(company_id);
CREATE INDEX idx_outreach_targets_campaign_id ON outreach_targets(campaign_id);
CREATE INDEX idx_browser_sessions_company_id ON browser_sessions(company_id);
CREATE INDEX idx_agents_company_id ON agents(company_id);
CREATE INDEX idx_conversations_company_id ON conversations(company_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_agent_runs_company_id ON agent_runs(company_id);
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_events_company_id_occurred_at ON events(company_id, occurred_at);
CREATE INDEX idx_metrics_daily_company_id_metric_date ON metrics_daily(company_id, metric_date);
CREATE INDEX idx_tasks_company_id_status ON tasks(company_id, status);
CREATE INDEX idx_tasks_scheduled_for ON tasks(scheduled_for);
CREATE INDEX idx_actions_company_id_created_at ON actions(company_id, created_at);
CREATE INDEX idx_webhooks_company_id_received_at ON webhooks(company_id, received_at);

-- =========================================================
-- 19. UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_company_modules_updated_at BEFORE UPDATE ON company_modules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_domains_updated_at BEFORE UPDATE ON domains
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sites_updated_at BEFORE UPDATE ON sites
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pages_updated_at BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON deals
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
-- =========================================================
-- V1 ADDITIONS - Required for launch
-- =========================================================

-- Agent memory (persistent per-company context)
CREATE TABLE IF NOT EXISTS company_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE,
    founder_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    company_summary TEXT,
    strategy TEXT,
    what_works TEXT,
    contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
    task_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email subscribers collected by client sites
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    source TEXT DEFAULT 'landing',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (company_id, email)
);

-- Page view analytics for client sites
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    path TEXT,
    referrer TEXT,
    ua TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_company_memory_company_id ON company_memory(company_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_company_id ON subscribers(company_id);
CREATE INDEX IF NOT EXISTS idx_page_views_company_id_created_at ON page_views(company_id, created_at);

-- Trigger for company_memory
CREATE TRIGGER IF NOT EXISTS trg_company_memory_updated_at 
BEFORE UPDATE ON company_memory 
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
