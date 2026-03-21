-- ─── Service Book v2 Migration ────────────────────────────────────────────────
-- Run this in Supabase → SQL Editor
-- Safe to run on an existing v1 database — uses ADD COLUMN IF NOT EXISTS.
-- Your existing clients, jobs, media, comments and audit log are preserved.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. clients: add city + primary equipment type ───────────────────────────
alter table public.clients
  add column if not exists city           text,
  add column if not exists equipment_type text
    check (equipment_type in ('heat_pump','oil_boiler','gas_boiler','other'));

-- ─── 2. jobs: add location/device link + archive flag ────────────────────────
alter table public.jobs
  add column if not exists location_id uuid,
  add column if not exists device_id   uuid,
  add column if not exists is_archived boolean not null default false;

-- ─── 3. locations (multiple addresses per client) ────────────────────────────
create table if not exists public.locations (
  id          uuid default gen_random_uuid() primary key,
  client_id   uuid references public.clients(id) not null,
  address     text not null,
  city        text,
  is_primary  boolean not null default false,
  notes       text,
  created_at  timestamptz not null default now(),
  created_by  uuid references public.profiles(id) not null
);

alter table public.locations enable row level security;

drop policy if exists "Admin can manage locations"     on public.locations;
drop policy if exists "Client can read own locations"  on public.locations;

create policy "Admin can manage locations"
  on public.locations for all
  using  (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "Client can read own locations"
  on public.locations for select
  using (
    exists (
      select 1 from public.clients c
      where c.id = client_id
        and c.profile_id = auth.uid()
    )
  );

-- ─── 4. devices (equipment per location) ─────────────────────────────────────
create table if not exists public.devices (
  id             uuid default gen_random_uuid() primary key,
  location_id    uuid references public.locations(id) not null,
  equipment_type text not null
    check (equipment_type in ('heat_pump','oil_boiler','gas_boiler','other')),
  manufacturer   text,
  model          text,
  serial_number  text,
  installed_date date,
  notes          text,
  created_at     timestamptz not null default now(),
  created_by     uuid references public.profiles(id) not null
);

alter table public.devices enable row level security;

drop policy if exists "Admin can manage devices"    on public.devices;
drop policy if exists "Client can read own devices" on public.devices;

create policy "Admin can manage devices"
  on public.devices for all
  using  (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "Client can read own devices"
  on public.devices for select
  using (
    exists (
      select 1 from public.locations l
        join public.clients c on c.id = l.client_id
      where l.id = location_id
        and c.profile_id = auth.uid()
    )
  );

-- ─── 5. Wire up FK from jobs → locations / devices ───────────────────────────
-- (safe — columns were added as nullable above)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'jobs_location_id_fkey'
  ) then
    alter table public.jobs
      add constraint jobs_location_id_fkey
      foreign key (location_id) references public.locations(id);
  end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'jobs_device_id_fkey'
  ) then
    alter table public.jobs
      add constraint jobs_device_id_fkey
      foreign key (device_id) references public.devices(id);
  end if;
end
$$;

-- ─── 6. notifications ────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id           uuid default gen_random_uuid() primary key,
  client_id    uuid references public.clients(id) not null,
  job_id       uuid references public.jobs(id),
  type         text not null
    check (type in ('job_completed','job_updated','service_reminder','access_required')),
  message      text not null,
  is_read      boolean not null default false,
  sent_at      timestamptz,
  email_status text not null default 'pending'
    check (email_status in ('pending','sent','failed')),
  created_at   timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Admin can manage notifications"    on public.notifications;
drop policy if exists "Client can read own notifications" on public.notifications;

create policy "Admin can manage notifications"
  on public.notifications for all
  using  (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "Client can read own notifications"
  on public.notifications for select
  using (
    exists (
      select 1 from public.clients c
      where c.id = client_id
        and c.profile_id = auth.uid()
    )
  );

-- ─── Done ────────────────────────────────────────────────────────────────────
-- New tables: locations, devices, notifications
-- New columns on clients: city, equipment_type
-- New columns on jobs: location_id, device_id, is_archived
-- All existing data is untouched.
