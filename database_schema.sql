-- Unicorns Hub - Supabase schema definitivo
-- Execute este arquivo no SQL Editor do Supabase.

drop table if exists public.saved_projects cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Founder Unicorns',
  avatar_url text,
  github_url text not null default '',
  linkedin_url text not null default '',
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) >= 2),
  repository text not null check (char_length(repository) >= 3),
  image_url text,
  owner text not null default 'Founder anonimo',
  status text not null default 'Buscando Mantenedor',
  difficulty text not null default 'Intermediario',
  stack text[] not null default '{}',
  stars integer not null default 0 check (stars >= 0),
  issues integer not null default 0 check (issues >= 0),
  created_at timestamptz not null default now(),
  adoptions_count integer not null default 0 check (adoptions_count >= 0),
  last_commit date not null default current_date,
  summary text not null check (char_length(summary) >= 10),
  stop_point text not null check (char_length(stop_point) >= 10),
  needs text not null check (char_length(needs) >= 10),
  updated_at timestamptz not null default now()
);

create table public.saved_projects (
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create index projects_created_at_idx on public.projects (created_at desc);
create index projects_adoptions_count_idx on public.projects (adoptions_count desc);
create index projects_name_idx on public.projects (name);
create index projects_user_id_idx on public.projects (user_id);
create index saved_projects_user_id_idx on public.saved_projects (user_id, created_at desc);
create index saved_projects_project_id_idx on public.saved_projects (project_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

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

create trigger saved_projects_refresh_count
after insert or delete on public.saved_projects
for each row
execute function public.refresh_project_adoptions_count();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Founder Unicorns'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.saved_projects enable row level security;

create policy "Anyone can read profiles"
on public.profiles
for select
using (true);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Anyone can read projects"
on public.projects
for select
using (true);

create policy "Authenticated users can create projects for themselves"
on public.projects
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Owners can update their projects"
on public.projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Owners can delete their projects"
on public.projects
for delete
to authenticated
using (auth.uid() = user_id);

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

alter table public.profiles replica identity full;
alter table public.projects replica identity full;
alter table public.saved_projects replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'projects'
  ) then
    alter publication supabase_realtime add table public.projects;
  end if;
end;
$$;

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

notify pgrst, 'reload schema';
