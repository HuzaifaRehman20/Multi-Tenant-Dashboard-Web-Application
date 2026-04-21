-- =============================================================
-- MULTI-TENANT DASHBOARD — SUPABASE SETUP SCRIPT
-- Run this entire file in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- =============================================================


-- =============================================================
-- 1. ORGANIZATIONS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 2. PROFILES TABLE
-- One profile per Supabase auth user. Links user → org + role.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 3. SALES TABLE
-- Every sale belongs to a user AND an organization.
-- organization_id is stored denormalized for fast RLS filtering.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.sales (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    amount          NUMERIC(12, 2) NOT NULL,
    description     TEXT,
    sale_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 4. ACTIVITIES TABLE
-- Tracks user activity events by category.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category        TEXT NOT NULL,
    description     TEXT,
    activity_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 5. INDEXES for performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_sales_org ON public.sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_user ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_activities_org ON public.activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_id);

-- =============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- This enforces multi-tenant isolation at the DATABASE level.
-- Even if the API were compromised, users cannot access
-- another organization's data.
-- =============================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities   ENABLE ROW LEVEL SECURITY;

-- Organizations: authenticated users can read all org names (needed for signup)
CREATE POLICY "orgs_read_all" ON public.organizations
    FOR SELECT TO authenticated USING (true);

-- Profiles: users can only read profiles in their own org
CREATE POLICY "profiles_same_org" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        organization_id = (
            SELECT organization_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Sales: admins see all org sales; users see only their own
CREATE POLICY "sales_org_isolation" ON public.sales
    FOR SELECT TO authenticated
    USING (
        organization_id = (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
        AND (
            -- User sees own rows; admin sees all in org
            user_id = auth.uid()
            OR (
                SELECT role FROM public.profiles WHERE id = auth.uid()
            ) = 'admin'
        )
    );

-- Activities: same pattern as sales
CREATE POLICY "activities_org_isolation" ON public.activities
    FOR SELECT TO authenticated
    USING (
        organization_id = (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
        AND (
            user_id = auth.uid()
            OR (
                SELECT role FROM public.profiles WHERE id = auth.uid()
            ) = 'admin'
        )
    );

-- =============================================================
-- 7. SAMPLE DATA
-- Two organizations, two admins, four regular users.
-- Replace UUIDs in profiles with real auth.users IDs after
-- you create accounts via the signup form.
-- =============================================================

-- Organizations
INSERT INTO public.organizations (id, name) VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001', 'Acme Corp'),
    ('bbbbbbbb-0000-0000-0000-000000000002', 'Globex Industries')
ON CONFLICT DO NOTHING;

-- =============================================================
-- 9. QUICK SEED SCRIPT (run AFTER creating users via signup)
-- This function auto-seeds data for all existing profiles.
-- Call: SELECT seed_sample_data();
-- =============================================================
CREATE OR REPLACE FUNCTION public.seed_sample_data()
RETURNS TEXT AS $$
DECLARE
    prof RECORD;
    i    INT;
    categories TEXT[] := ARRAY['Demo', 'Call', 'Email', 'Meeting', 'Proposal'];
    descriptions TEXT[] := ARRAY[
        'Enterprise license deal', 'Consulting engagement', 'Annual subscription renewal',
        'Support package', 'Professional services', 'Training session',
        'Software license', 'Ad-hoc project', 'Partnership deal', 'Small business plan'
    ];
BEGIN
    FOR prof IN SELECT id, organization_id FROM public.profiles LOOP
        -- Insert 10 sales spread over past 30 days
        FOR i IN 1..10 LOOP
            INSERT INTO public.sales (user_id, organization_id, amount, description, sale_date)
            VALUES (
                prof.id,
                prof.organization_id,
                ROUND((RANDOM() * 4500 + 200)::NUMERIC, 2),
                descriptions[1 + (i % array_length(descriptions, 1))],
                CURRENT_DATE - ((30 - i * 3) || ' days')::INTERVAL
            )
            ON CONFLICT DO NOTHING;
        END LOOP;

        -- Insert 10 activities spread over past 30 days
        FOR i IN 1..10 LOOP
            INSERT INTO public.activities (user_id, organization_id, category, description, activity_date)
            VALUES (
                prof.id,
                prof.organization_id,
                categories[1 + (i % array_length(categories, 1))],
                'Activity record ' || i,
                CURRENT_DATE - ((30 - i * 3) || ' days')::INTERVAL
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    RETURN 'Seeded data for all profiles successfully.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;