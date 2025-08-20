-- Enable RLS and basic org scoping
alter table orgs enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table locations enable row level security;
alter table org_subscriptions enable row level security;
alter table plans enable row level security;

-- Helper functions expected by earlier logic (stubbed)
create or replace function current_org() returns uuid language sql stable as $$
  select (select org_id from profiles where id = auth.uid())
$$;

create or replace function current_role() returns text language sql stable as $$
  select coalesce((select role from profiles where id = auth.uid()), 'owner')
$$;

-- Plans readable
create policy "plans readable" on plans for select using (true);

-- Profiles: only your org
create policy "profiles read own org" on profiles for select using (org_id = current_org());
create policy "profiles manage own org" on profiles for all using (org_id = current_org()) with check (org_id = current_org());

-- Customers
create policy "customers read own org" on customers for select using (org_id = current_org());
create policy "customers insert own org" on customers for insert with check (org_id = current_org());
create policy "customers update own org" on customers for update using (org_id = current_org());
create policy "customers delete own org" on customers for delete using (org_id = current_org());

-- Locations via customer org
create policy "locations read via customer org" on locations for select using (
  exists (select 1 from customers c where c.id = locations.customer_id and c.org_id = current_org())
);
create policy "locations write via customer org" on locations for all using (
  exists (select 1 from customers c where c.id = locations.customer_id and c.org_id = current_org())
) with check (
  exists (select 1 from customers c where c.id = locations.customer_id and c.org_id = current_org())
);

-- Subscriptions readable to own org
create policy "org_subscriptions read own" on org_subscriptions for select using (org_id = current_org());
create policy "org_subscriptions upsert own" on org_subscriptions for all using (org_id = current_org()) with check (org_id = current_org());
