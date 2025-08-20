-- Minimal tables for app to run (expand with your production schema)
create table if not exists orgs (id uuid primary key default gen_random_uuid(), name text);
create table if not exists profiles (
  id uuid primary key,
  org_id uuid references orgs(id),
  full_name text,
  role text check (role in ('owner','manager','invoicer','installer')) default 'owner',
  created_at timestamptz default now()
);
create table if not exists customers (id uuid primary key default gen_random_uuid(), org_id uuid references orgs(id), name text not null, email text, phone text, created_at timestamptz default now());
create table if not exists locations (id uuid primary key default gen_random_uuid(), customer_id uuid references customers(id) on delete cascade, address1 text, city text, state text, zip text, lat double precision, lng double precision);
create table if not exists plans (id text primary key, name text not null, price_cents int not null, monthly_customer_cap int, employee_cap int, features text[] default '{}', created_at timestamptz default now());
create table if not exists org_subscriptions (org_id uuid primary key references orgs(id) on delete cascade, plan_id text references plans(id), stripe_subscription_id text, stripe_price_id text, stripe_billing_customer_id text, status text, trial_end timestamptz, current_period_end timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());

-- Seed plans
insert into plans (id,name,price_cents,monthly_customer_cap,employee_cap,features) values
('starter','Starter',2900,1000,2,ARRAY['invoices','estimates','basic_schedule','storage','stripe_sync']),
('pro','Professional',7900,2000,50,ARRAY['invoices','estimates','basic_schedule','storage','stripe_sync','mapping','roles','reports','installer_portal']),
('enterprise','Enterprise',14900,null,null,ARRAY['invoices','estimates','basic_schedule','storage','stripe_sync','mapping','roles','reports','installer_portal','multi_location','advanced_analytics','advanced_optimizer','auto_assign','depot_per_crew','calendar_dragdrop'])
on conflict (id) do update set name=excluded.name;

-- Views for mapping (stub; replace with your richer view)
create or replace view customer_metrics_ext as
select c.id as customer_id, c.name, l.lat, l.lng, l.address1, l.city, l.state, l.zip,
  'new'::text as latest_stage,
  null::timestamptz as last_job_date,
  0::numeric as total_revenue,
  null::text as last_job_status
from customers c
left join locations l on l.customer_id = c.id;
