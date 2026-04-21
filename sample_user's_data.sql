-- =============================================================
-- SAMPLE DATA FOR BOTH ORGANIZATION'S e,g, JANE & BILL
-- Jane (user@acme.com)     — Acme Corp     — High-value sales, Demo/Meeting heavy
-- Bill (user@globex.com)   — Globex Ind.   — Steady smaller sales, Call/Email heavy
-- Run this in Supabase SQL Editor
-- =============================================================

-- User UUIDs
-- Jane : 157ee3da-f683-4da7-9188-f39a85936219  |  org: aaaaaaaa-0000-0000-0000-000000000001
-- Bill : a3a7f5be-bab9-4187-bc51-f051e5ad09cd  |  org: bbbbbbbb-0000-0000-0000-000000000002


-- =============================================================
-- JANE'S SALES  (Acme Corp — big spikes, high-value deals)
-- =============================================================
INSERT INTO public.sales (user_id, organization_id, amount, description, sale_date) VALUES
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 4200.00, 'Enterprise software license',        CURRENT_DATE - INTERVAL '29 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 1850.50, 'Premium support package',             CURRENT_DATE - INTERVAL '26 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 6750.00, 'Annual enterprise subscription',      CURRENT_DATE - INTERVAL '23 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 980.00,  'Add-on module purchase',              CURRENT_DATE - INTERVAL '21 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 5300.00, 'Professional services bundle',        CURRENT_DATE - INTERVAL '18 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 2100.75, 'Staff training session x3',           CURRENT_DATE - INTERVAL '15 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 7800.00, 'Multi-year enterprise deal',          CURRENT_DATE - INTERVAL '12 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 1450.00, 'Consulting engagement',               CURRENT_DATE - INTERVAL '9 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 3900.00, 'Custom integration project',          CURRENT_DATE - INTERVAL '5 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 5600.00, 'Q2 renewal + upgrade',                CURRENT_DATE - INTERVAL '2 days');


-- =============================================================
-- BILL'S SALES  (Globex — steady cadence, smaller consistent deals)
-- =============================================================
INSERT INTO public.sales (user_id, organization_id, amount, description, sale_date) VALUES
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 620.00,  'Starter plan subscription',           CURRENT_DATE - INTERVAL '28 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 745.50,  'Monthly retainer - client A',         CURRENT_DATE - INTERVAL '25 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 510.00,  'Basic support renewal',               CURRENT_DATE - INTERVAL '23 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 890.00,  'SMB license pack x5',                 CURRENT_DATE - INTERVAL '20 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 430.25,  'Ad-hoc consulting hour x2',           CURRENT_DATE - INTERVAL '17 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 675.00,  'Monthly retainer - client B',         CURRENT_DATE - INTERVAL '14 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 320.00,  'Onboarding package - small team',     CURRENT_DATE - INTERVAL '11 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 950.00,  'Quarterly business review',           CURRENT_DATE - INTERVAL '7 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 560.75,  'Plugin license renewal',              CURRENT_DATE - INTERVAL '4 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 810.00,  'Year-end small business deal',        CURRENT_DATE - INTERVAL '1 day');


-- =============================================================
-- JANE'S ACTIVITIES  (Demo & Meeting focused — fewer but bigger)
-- =============================================================
INSERT INTO public.activities (user_id, organization_id, category, description, activity_date) VALUES
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Demo',     'Live product demo — enterprise prospect',       CURRENT_DATE - INTERVAL '28 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Meeting',  'Executive kickoff with C-suite',                CURRENT_DATE - INTERVAL '26 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Demo',     'Technical deep-dive demo',                      CURRENT_DATE - INTERVAL '23 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Proposal', 'Sent enterprise pricing proposal',              CURRENT_DATE - INTERVAL '21 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Meeting',  'Quarterly business review - key account',       CURRENT_DATE - INTERVAL '18 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Demo',     'Follow-up demo for stakeholders',               CURRENT_DATE - INTERVAL '15 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Meeting',  'Contract negotiation session',                  CURRENT_DATE - INTERVAL '12 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Proposal', 'Multi-year renewal proposal',                   CURRENT_DATE - INTERVAL '9 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Demo',     'Onboarding walkthrough for new team',           CURRENT_DATE - INTERVAL '5 days'),
    ('157ee3da-f683-4da7-9188-f39a85936219', 'aaaaaaaa-0000-0000-0000-000000000001', 'Meeting',  'Post-sale success check-in',                    CURRENT_DATE - INTERVAL '2 days');


-- =============================================================
-- BILL'S ACTIVITIES  (Call & Email heavy — high volume, frequent)
-- =============================================================
INSERT INTO public.activities (user_id, organization_id, category, description, activity_date) VALUES
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Call',     'Cold outreach call — prospect list A',          CURRENT_DATE - INTERVAL '29 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Email',    'Intro email campaign — batch 1',                CURRENT_DATE - INTERVAL '27 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Call',     'Follow-up call after email open',               CURRENT_DATE - INTERVAL '25 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Email',    'Feature highlight newsletter',                  CURRENT_DATE - INTERVAL '22 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Call',     'Discovery call — inbound lead',                 CURRENT_DATE - INTERVAL '20 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Email',    'Pricing & proposal follow-up email',            CURRENT_DATE - INTERVAL '17 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Call',     'Check-in call — existing customer',             CURRENT_DATE - INTERVAL '14 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Email',    'Re-engagement email — churned user',            CURRENT_DATE - INTERVAL '10 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Call',     'Renewal reminder call',                         CURRENT_DATE - INTERVAL '6 days'),
    ('a3a7f5be-bab9-4187-bc51-f051e5ad09cd', 'bbbbbbbb-0000-0000-0000-000000000002', 'Email',    'Thank you + next steps email',                  CURRENT_DATE - INTERVAL '2 days');