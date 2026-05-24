-- Unicorns Hub - hotfix de coluna adoptions_count
-- Execute este arquivo no SQL Editor do Supabase se o PostgREST retornar:
-- "Could not find the 'adoptions_count' column of 'projects' in the schema cache"

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'adoptionscount'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'adoptions_count'
  ) then
    alter table public.projects rename column adoptionscount to adoptions_count;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'adoptionsCount'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'adoptions_count'
  ) then
    alter table public.projects rename column "adoptionsCount" to adoptions_count;
  end if;
end;
$$;

alter table public.projects
add column if not exists adoptions_count integer not null default 0;

alter table public.projects
alter column adoptions_count set default 0;

update public.projects
set adoptions_count = 0
where adoptions_count is null;

alter table public.projects
drop constraint if exists projects_adoptions_count_check;

alter table public.projects
add constraint projects_adoptions_count_check check (adoptions_count >= 0);

create index if not exists projects_adoptions_count_idx
on public.projects (adoptions_count desc);

notify pgrst, 'reload schema';
