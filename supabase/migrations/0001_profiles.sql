-- Phase 1 — Identity foundation.
-- profiles: 1:1 with auth.users, holds the role + display fields the app reads.
-- Every new signup gets a row (via trigger) defaulting to role='reader'.
-- Higher roles are granted manually; a user can never elevate their own role.

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url   text,
  role         text not null default 'reader'
                 check (role in ('reader', 'contributor', 'editor', 'admin')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can read and update only their own profile row.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Self-elevation guard: block role changes made by the row's own user.
-- Privileged updates (service role / SQL editor) have auth.uid() = null and pass,
-- so admins can still promote people.
create or replace function public.prevent_self_role_change()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'You cannot change your own role.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_no_self_role_change on public.profiles;
create trigger profiles_no_self_role_change
  before update on public.profiles
  for each row execute function public.prevent_self_role_change();

-- Create the profile row automatically on signup, pulling display fields from
-- whatever the OAuth provider (or email signup) supplied.
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
