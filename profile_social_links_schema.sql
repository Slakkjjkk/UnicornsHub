alter table public.profiles
add column if not exists github_url text not null default '';

alter table public.profiles
add column if not exists linkedin_url text not null default '';

notify pgrst, 'reload schema';
