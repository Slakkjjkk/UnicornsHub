create table if not exists public.saved_projects (
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create index if not exists saved_projects_user_id_idx
on public.saved_projects (user_id, created_at desc);

create index if not exists saved_projects_project_id_idx
on public.saved_projects (project_id);

create or replace function public.refresh_project_adoptions_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  affected_project_id uuid;
begin
  affected_project_id = coalesce(new.project_id, old.project_id);

  update public.projects
  set adoptions_count = (
    select count(*)::integer
    from public.saved_projects
    where project_id = affected_project_id
  )
  where id = affected_project_id;

  return coalesce(new, old);
end;
$$;

create or replace function public.sync_project_adoptions_count(project_id_input uuid)
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  next_count integer;
begin
  select count(*)::integer
  into next_count
  from public.saved_projects
  where project_id = project_id_input;

  update public.projects
  set adoptions_count = next_count
  where id = project_id_input;

  return next_count;
end;
$$;

drop trigger if exists saved_projects_refresh_count on public.saved_projects;

create trigger saved_projects_refresh_count
after insert or delete on public.saved_projects
for each row
execute function public.refresh_project_adoptions_count();

alter table public.saved_projects enable row level security;

drop policy if exists "Users can read their saved projects" on public.saved_projects;
drop policy if exists "Users can save projects for themselves" on public.saved_projects;
drop policy if exists "Users can remove their saved projects" on public.saved_projects;

create policy "Users can read their saved projects"
on public.saved_projects
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can save projects for themselves"
on public.saved_projects
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove their saved projects"
on public.saved_projects
for delete
to authenticated
using (auth.uid() = user_id);

alter table public.saved_projects replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'saved_projects'
  ) then
    alter publication supabase_realtime add table public.saved_projects;
  end if;
end;
$$;

update public.projects
set adoptions_count = counts.total
from (
  select project_id, count(*)::integer as total
  from public.saved_projects
  group by project_id
) as counts
where public.projects.id = counts.project_id;

notify pgrst, 'reload schema';
