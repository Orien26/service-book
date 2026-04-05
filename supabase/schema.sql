-- ─── Service Book Schema ──────────────────────────────────────────────────────
-- Run this in your Supabase project → SQL Editor
-- Everything is append-only. DELETE is blocked by RLS for all users.
-- Safe to re-run: drops existing objects first.

-- ─── Drop existing objects (for clean re-run) ────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.get_my_role();
drop table if exists public.audit_log cascade;
drop table if exists public.comments cascade;
drop table if exists public.job_media cascade;
drop table if exists public.jobs cascade;
drop table if exists public.clients cascade;
drop table if exists public.profiles cascade;
drop table if exists public.app_config cascade;

-- ─── App config (admin email for auto role assignment) ───────────────────────
create table public.app_config (
  key   text primary key,
  value text not null
);
-- Insert your admin email here:
insert into public.app_config (key, value) values ('admin_email', 'dannsnetwork@gmail.com');

-- ─── Helper: get current user role (security definer bypasses RLS) ───────────
-- Defined BEFORE policies so all policies can use it without infinite recursion.
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ─── Profiles (extends auth.users) ───────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  role        text not null default 'client' check (role in ('admin', 'client')),
  full_name   text,
  phone       text,
  created_at  timestamptz default now() not null
);
alter table public.profiles enable row level security;

-- Use get_my_role() (security definer) to avoid infinite recursion on profiles
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin can read all profiles"
  on public.profiles for select
  using (public.get_my_role() = 'admin');

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── Clients (property/building owners) ──────────────────────────────────────
create table public.clients (
  id               uuid default gen_random_uuid() primary key,
  full_name        text not null,
  phone            text,
  email            text,
  property_address text not null,
  property_notes   text,
  profile_id       uuid references public.profiles(id),  -- set when client registers
  created_at       timestamptz default now() not null,
  created_by       uuid references public.profiles(id) not null
);
alter table public.clients enable row level security;

create policy "Admin can manage clients"
  on public.clients for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "Client can read own record"
  on public.clients for select
  using (profile_id = auth.uid());

-- ─── Jobs (service/maintenance jobs) ─────────────────────────────────────────
create table public.jobs (
  id               uuid default gen_random_uuid() primary key,
  client_id        uuid references public.clients(id) not null,
  title            text not null,
  issue_description text,
  work_done        text,
  parts_replaced   text,
  status           text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  service_date     date not null default current_date,
  next_service_date date,
  total_amount     numeric(10,2),
  currency         text default 'NGN',
  created_at       timestamptz default now() not null,
  created_by       uuid references public.profiles(id) not null,
  is_hidden        boolean default false not null,
  hidden_at        timestamptz,
  hidden_by        uuid references public.profiles(id),
  hidden_reason    text
);
alter table public.jobs enable row level security;

create policy "Admin can manage jobs"
  on public.jobs for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "Client can read own jobs"
  on public.jobs for select
  using (
    exists (
      select 1 from public.clients c
      where c.id = client_id and c.profile_id = auth.uid()
    )
  );

-- ─── Job Media (before/after photos and invoices) ────────────────────────────
create table public.job_media (
  id           uuid default gen_random_uuid() primary key,
  job_id       uuid references public.jobs(id) not null,
  media_type   text not null check (media_type in ('before', 'after', 'invoice')),
  storage_path text not null,
  file_name    text not null,
  created_at   timestamptz default now() not null,
  created_by   uuid references public.profiles(id) not null,
  is_hidden    boolean default false not null,
  hidden_at    timestamptz,
  hidden_reason text
);
alter table public.job_media enable row level security;

create policy "Admin can manage media"
  on public.job_media for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

create policy "Client can read own job media"
  on public.job_media for select
  using (
    exists (
      select 1 from public.jobs j
      join public.clients c on c.id = j.client_id
      where j.id = job_id and c.profile_id = auth.uid()
    )
  );

-- ─── Comments (append-only — no update/delete ever) ──────────────────────────
create table public.comments (
  id          uuid default gen_random_uuid() primary key,
  job_id      uuid references public.jobs(id) not null,
  content     text not null,
  author_name text,
  created_by  uuid references public.profiles(id) not null,
  created_at  timestamptz default now() not null
);
alter table public.comments enable row level security;

create policy "Admin can read comments"
  on public.comments for select
  using (public.get_my_role() = 'admin');

create policy "Admin can insert comments"
  on public.comments for insert
  with check (public.get_my_role() = 'admin');

create policy "Client can read own job comments"
  on public.comments for select
  using (
    exists (
      select 1 from public.jobs j
      join public.clients c on c.id = j.client_id
      where j.id = job_id and c.profile_id = auth.uid()
    )
  );

create policy "Client can insert comments on own jobs"
  on public.comments for insert
  with check (
    exists (
      select 1 from public.jobs j
      join public.clients c on c.id = j.client_id
      where j.id = job_id and c.profile_id = auth.uid()
    )
  );

-- No UPDATE or DELETE policies on comments — intentionally omitted.

-- ─── Audit Log (immutable record) ────────────────────────────────────────────
create table public.audit_log (
  id           uuid default gen_random_uuid() primary key,
  table_name   text not null,
  record_id    uuid,
  action       text not null,
  data         jsonb,
  performed_by uuid references public.profiles(id),
  created_at   timestamptz default now() not null
);
alter table public.audit_log enable row level security;

create policy "Admin can read audit log"
  on public.audit_log for select
  using (public.get_my_role() = 'admin');

create policy "System can insert audit log"
  on public.audit_log for insert
  with check (true);

-- ─── Storage bucket ──────────────────────────────────────────────────────────
-- Run in Supabase dashboard → Storage → New bucket: "job-media" (private)
-- Then add these storage policies:
-- Policy: Admin can upload — INSERT — authenticated — (select role from profiles where id = auth.uid()) = 'admin'
-- Policy: Authenticated users can read — SELECT — authenticated — true

-- ─── Trigger: auto-create profile on signup ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  admin_email text;
  user_role   text := 'client';
begin
  select value into admin_email from public.app_config where key = 'admin_email';

  if new.email = admin_email then
    user_role := 'admin';
  end if;

  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    user_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
