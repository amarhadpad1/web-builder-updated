-- rls_test.sql - proves the access rules in 0001_projects.sql really work.
--
-- HOW TO RUN: Supabase dashboard > SQL Editor > New query > paste this whole file > Run.
-- It creates two throw-away users (A and B), tries every kind of forbidden access as each of them (and as a visitor
-- who is not signed in), prints a table of PASS/FAIL lines, and then ROLLS EVERYTHING BACK, so it leaves no data behind.
-- Every row in the result table must say passed = true. If any says false, DO NOT launch: tell me which one.
--
-- STATUS: written, but NOT yet run against a real Supabase project (no PostgreSQL was available where it was written).
-- If the first INSERT into auth.users fails because your Supabase version wants more columns, add the ones it names.

begin;

create temp table t_results (name text, passed boolean) on commit drop;
grant all on t_results to public;

insert into auth.users (id, email, instance_id, aud, role) values
  ('aaaaaaaa-0000-0000-0000-00000000000a', 'rls-test-a@example.invalid', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'rls-test-b@example.invalid', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');

-- ===================================================== A creates things
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-00000000000a","role":"authenticated"}', true);

insert into public.projects (id, name, data) values ('11111111-0000-0000-0000-000000000001', 'A site', '{"state":{"bizName":"A"}}');
insert into t_results select 'A can create and read own project', exists (select 1 from public.projects where id = '11111111-0000-0000-0000-000000000001');
insert into t_results select 'owner_id was filled in from the login (not chosen by the browser)', (select owner_id = 'aaaaaaaa-0000-0000-0000-00000000000a' from public.projects where id = '11111111-0000-0000-0000-000000000001');
insert into t_results select 'version starts at 1', (select version = 1 from public.projects where id = '11111111-0000-0000-0000-000000000001');

update public.projects set data = '{"state":{"bizName":"A2"}}' where id = '11111111-0000-0000-0000-000000000001' and version = 1;
insert into t_results select 'update raises version to 2', (select version = 2 from public.projects where id = '11111111-0000-0000-0000-000000000001');
insert into t_results select 'update with a stale version changes nothing (overwrite protection)',
  (with u as (update public.projects set name = 'stale' where id = '11111111-0000-0000-0000-000000000001' and version = 1 returning 1) select count(*) = 0 from u);
insert into t_results select 'first data change kept the old data as a revision', exists (select 1 from public.project_revisions where project_id = '11111111-0000-0000-0000-000000000001' and version = 1);

do $$ begin begin
  update public.projects set owner_id = 'bbbbbbbb-0000-0000-0000-00000000000b' where id = '11111111-0000-0000-0000-000000000001';
  insert into t_results values ('A cannot give the project to someone else', false);
exception when others then insert into t_results values ('A cannot give the project to someone else', true); end; end $$;

do $$ begin begin
  insert into public.project_revisions (project_id, owner_id, version, name, data) values ('11111111-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-00000000000a', 9, 'x', '{}');
  insert into t_results values ('users cannot write revisions directly', false);
exception when others then insert into t_results values ('users cannot write revisions directly', true); end; end $$;

insert into public.project_assets (project_id, slot, storage_path, file_name, mime_type, size_bytes)
values ('11111111-0000-0000-0000-000000000001', 'logo', 'aaaaaaaa-0000-0000-0000-00000000000a/11111111-0000-0000-0000-000000000001/logo-x.png', 'logo.png', 'image/png', 100);
insert into t_results select 'A can add a photo record to own project', exists (select 1 from public.project_assets where slot = 'logo');

do $$ begin begin
  insert into public.project_assets (project_id, slot, storage_path, file_name, mime_type, size_bytes)
  values ('11111111-0000-0000-0000-000000000001', 'hero', 'bbbbbbbb-0000-0000-0000-00000000000b/x/hero.png', 'hero.png', 'image/png', 100);
  insert into t_results values ('a photo record cannot point into another user''s folder', false);
exception when others then insert into t_results values ('a photo record cannot point into another user''s folder', true); end; end $$;

do $$ begin begin
  insert into public.project_assets (project_id, slot, storage_path, file_name, mime_type, size_bytes)
  values ('11111111-0000-0000-0000-000000000001', 'hero', 'aaaaaaaa-0000-0000-0000-00000000000a/11111111-0000-0000-0000-000000000001/h.svg', 'h.svg', 'image/svg+xml', 100);
  insert into t_results values ('only safe image types are accepted (SVG refused)', false);
exception when others then insert into t_results values ('only safe image types are accepted (SVG refused)', true); end; end $$;

insert into storage.objects (bucket_id, name) values ('project-assets', 'aaaaaaaa-0000-0000-0000-00000000000a/11111111-0000-0000-0000-000000000001/logo-x.png');
insert into t_results select 'A can store a file in own project folder', exists (select 1 from storage.objects where bucket_id = 'project-assets' and name like 'aaaaaaaa-%');

do $$ begin begin
  insert into storage.objects (bucket_id, name) values ('project-assets', 'aaaaaaaa-0000-0000-0000-00000000000a/99999999-0000-0000-0000-000000000009/x.png');
  insert into t_results values ('A cannot store files under a project A does not own', false);
exception when others then insert into t_results values ('A cannot store files under a project A does not own', true); end; end $$;

do $$ begin begin
  insert into public.projects (name, data) values ('too big', jsonb_build_object('x', repeat('x', 2100000)));
  insert into t_results values ('oversized project data (over 2 MB) is refused', false);
exception when others then insert into t_results values ('oversized project data (over 2 MB) is refused', true); end; end $$;

-- ===================================================== B attacks
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-0000-0000-00000000000b","role":"authenticated"}', true);

insert into t_results select 'B cannot read A''s projects', (select count(*) = 0 from public.projects);
insert into t_results select 'B cannot read A''s revisions', (select count(*) = 0 from public.project_revisions);
insert into t_results select 'B cannot read A''s photo records', (select count(*) = 0 from public.project_assets);
insert into t_results select 'B cannot see A''s files', (select count(*) = 0 from storage.objects where bucket_id = 'project-assets');
insert into t_results select 'B cannot rename A''s project', (with u as (update public.projects set name = 'hacked' where id = '11111111-0000-0000-0000-000000000001' returning 1) select count(*) = 0 from u);
insert into t_results select 'B cannot delete A''s project', (with d as (delete from public.projects where id = '11111111-0000-0000-0000-000000000001' returning 1) select count(*) = 0 from d);
insert into t_results select 'B cannot delete A''s photo records', (with d as (delete from public.project_assets returning 1) select count(*) = 0 from d);

do $$ begin begin
  insert into public.projects (name, owner_id) values ('stolen', 'aaaaaaaa-0000-0000-0000-00000000000a');
  insert into t_results values ('B cannot create a project owned by A', false);
exception when others then insert into t_results values ('B cannot create a project owned by A', true); end; end $$;

do $$ begin begin
  insert into public.project_assets (project_id, slot, storage_path, file_name, mime_type, size_bytes)
  values ('11111111-0000-0000-0000-000000000001', 'photo1', 'bbbbbbbb-0000-0000-0000-00000000000b/11111111-0000-0000-0000-000000000001/p.png', 'p.png', 'image/png', 100);
  insert into t_results values ('B cannot attach photos to A''s project', false);
exception when others then insert into t_results values ('B cannot attach photos to A''s project', true); end; end $$;

do $$ begin begin
  insert into storage.objects (bucket_id, name) values ('project-assets', 'aaaaaaaa-0000-0000-0000-00000000000a/11111111-0000-0000-0000-000000000001/evil.png');
  insert into t_results values ('B cannot store files in A''s folder', false);
exception when others then insert into t_results values ('B cannot store files in A''s folder', true); end; end $$;

insert into t_results select 'B cannot delete A''s files', (with d as (delete from storage.objects where bucket_id = 'project-assets' returning 1) select count(*) = 0 from d);

-- ===================================================== a visitor who is not signed in
reset role;
set local role anon;
do $$ begin begin
  perform count(*) from public.projects;
  insert into t_results values ('a visitor who is not signed in cannot read projects', false);
exception when others then insert into t_results values ('a visitor who is not signed in cannot read projects', true); end; end $$;
do $$ begin begin
  insert into public.projects (name) values ('anon');
  insert into t_results values ('a visitor who is not signed in cannot create projects', false);
exception when others then insert into t_results values ('a visitor who is not signed in cannot create projects', true); end; end $$;

-- ===================================================== the limit of 200 projects per account
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-0000-0000-00000000000b","role":"authenticated"}', true);
insert into public.projects (name) select 'p' || g from generate_series(1, 200) g;
do $$ begin begin
  insert into public.projects (name) values ('one too many');
  insert into t_results values ('an account cannot hold more than 200 projects', false);
exception when others then insert into t_results values ('an account cannot hold more than 200 projects', true); end; end $$;

-- ===================================================== report
reset role;
select name, passed from t_results order by passed, name;
select case when bool_and(passed) then 'ALL ' || count(*) || ' CHECKS PASSED' else 'SOME CHECKS FAILED: see the rows above with passed = false' end as verdict from t_results;

rollback;
