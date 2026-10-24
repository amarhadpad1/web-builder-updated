-- 0001_projects.sql
-- Website projects, their version history, their photo records, and the private photo bucket.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste this whole file > Run.
-- It is safe to run again (it uses "if not exists" / "or replace" where possible).
--
-- Security model in one sentence: a signed-in user can only ever see and change rows whose owner_id is their own
-- user id. That is enforced HERE, inside the database (Row Level Security), so it cannot be bypassed by editing
-- the web page. Visitors who are not signed in can do nothing at all.

-- ---------------------------------------------------------------- projects
create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 200),
  -- the whole form + design (never image files, only their names); capped at 2 MB so nobody can fill the database
  data       jsonb not null default '{}'::jsonb check (octet_length(data::text) <= 2000000),
  version    integer not null default 1,           -- raised by 1 on every change; used to stop accidental overwrites
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz                             -- set = in "Show deleted" (recoverable), null = normal
);
create index if not exists projects_owner_updated_idx on public.projects (owner_id, updated_at desc);

-- ---------------------------------------------------------------- version history
create table if not exists public.project_revisions (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  owner_id   uuid not null references auth.users (id) on delete cascade,
  version    integer not null,
  name       text not null,
  data       jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists project_revisions_project_idx on public.project_revisions (project_id, created_at desc);

-- ---------------------------------------------------------------- photo records (the files live in Storage)
create table if not exists public.project_assets (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  owner_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slot         text not null check (slot ~ '^(logo|hero|photo[0-9]{1,2})$'),
  storage_path text not null,
  file_name    text not null check (char_length(file_name) <= 120),
  mime_type    text not null check (mime_type in ('image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif')),
  size_bytes   bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at   timestamptz not null default now(),
  unique (project_id, slot),
  -- a file must sit in  <owner id>/<project id>/...  so it can never point into someone else's folder
  constraint project_assets_path_ok check (storage_path like owner_id::text || '/' || project_id::text || '/%')
);

-- ---------------------------------------------------------------- triggers
-- On insert: the server decides version/dates, and one account may not create unlimited projects.
create or replace function public.projects_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.version := 1; new.created_at := now(); new.updated_at := now();
  if (select count(*) from public.projects p where p.owner_id = new.owner_id and p.deleted_at is null) >= 200 then
    raise exception 'Project limit reached (200). Delete some websites first.' using errcode = 'P0001';
  end if;
  return new;
end $$;

-- On update: owner can never change, version always goes up by one, and the previous text/design is kept as a
-- revision (at most one per 10 minutes, newest 50 kept) so a bad edit can be undone.
create or replace function public.projects_before_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'owner_id cannot be changed' using errcode = '42501';
  end if;
  new.id := old.id; new.created_at := old.created_at;
  new.version := old.version + 1; new.updated_at := now();
  if old.data is distinct from new.data
     and not exists (select 1 from public.project_revisions r where r.project_id = old.id and r.created_at > now() - interval '10 minutes') then
    insert into public.project_revisions (project_id, owner_id, version, name, data)
    values (old.id, old.owner_id, old.version, old.name, old.data);
    delete from public.project_revisions
     where project_id = old.id
       and id not in (select id from public.project_revisions where project_id = old.id order by created_at desc limit 50);
  end if;
  return new;
end $$;

drop trigger if exists projects_bi on public.projects;
create trigger projects_bi before insert on public.projects for each row execute function public.projects_before_insert();
drop trigger if exists projects_bu on public.projects;
create trigger projects_bu before update on public.projects for each row execute function public.projects_before_update();
revoke execute on function public.projects_before_insert() from public, anon, authenticated;
revoke execute on function public.projects_before_update() from public, anon, authenticated;

-- ---------------------------------------------------------------- Row Level Security
alter table public.projects         enable row level security;
alter table public.project_revisions enable row level security;
alter table public.project_assets   enable row level security;

-- Nobody who is not signed in can touch these tables; signed-in users only get the rights granted below,
-- and even those only apply to their own rows (policies).
revoke all on public.projects, public.project_revisions, public.project_assets from anon, public;
grant select, insert, update, delete on public.projects       to authenticated;
grant select, insert, update, delete on public.project_assets to authenticated;
grant select                         on public.project_revisions to authenticated;   -- written only by the trigger above

drop policy if exists projects_select_own on public.projects;
drop policy if exists projects_insert_own on public.projects;
drop policy if exists projects_update_own on public.projects;
drop policy if exists projects_delete_own on public.projects;
create policy projects_select_own on public.projects for select to authenticated using (owner_id = (select auth.uid()));
create policy projects_insert_own on public.projects for insert to authenticated with check (owner_id = (select auth.uid()));
create policy projects_update_own on public.projects for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy projects_delete_own on public.projects for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists revisions_select_own on public.project_revisions;
create policy revisions_select_own on public.project_revisions for select to authenticated using (owner_id = (select auth.uid()));

-- Assets: the row must be yours AND the project it points at must be yours too.
drop policy if exists assets_select_own on public.project_assets;
drop policy if exists assets_insert_own on public.project_assets;
drop policy if exists assets_update_own on public.project_assets;
drop policy if exists assets_delete_own on public.project_assets;
create policy assets_select_own on public.project_assets for select to authenticated using (owner_id = (select auth.uid()));
create policy assets_insert_own on public.project_assets for insert to authenticated with check (
  owner_id = (select auth.uid())
  and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy assets_update_own on public.project_assets for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid())
              and exists (select 1 from public.projects p where p.id = project_id and p.owner_id = (select auth.uid())));
create policy assets_delete_own on public.project_assets for delete to authenticated using (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------- photo files (Storage)
-- Private bucket: files are never public. Only images, 10 MB at most each.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-assets', 'project-assets', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- File paths look like  <user id>/<project id>/<slot>-<random>.<ext>  and the rules check both parts.
drop policy if exists "assets read own folder"   on storage.objects;
drop policy if exists "assets insert own folder" on storage.objects;
drop policy if exists "assets update own folder" on storage.objects;
drop policy if exists "assets delete own folder" on storage.objects;
create policy "assets read own folder" on storage.objects for select to authenticated
  using (bucket_id = 'project-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "assets insert own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.projects p where p.id::text = (storage.foldername(name))[2] and p.owner_id = (select auth.uid())));
create policy "assets update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'project-assets' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'project-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "assets delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'project-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
