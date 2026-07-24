begin;

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'teacher');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null,
  full_name text not null default '',
  school_name text not null default '',
  role public.app_role not null default 'teacher',
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create unique index profiles_username_lower_uidx on public.profiles (lower(username));
create index profiles_role_idx on public.profiles (role);
create index profiles_active_idx on public.profiles (is_active);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('ҚМЖ', 'Тапсырма', 'Тест', 'Жұмыс парағы')),
  title text not null,
  grade text not null,
  topic text not null default '',
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index materials_user_created_idx on public.materials (user_id, created_at desc);
create index materials_user_type_idx on public.materials (user_id, type);
create index materials_user_grade_idx on public.materials (user_id, grade);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger materials_set_updated_at before update on public.materials
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, school_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    lower(coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(coalesce(new.email, new.id::text), '@', 1))),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'school_name', ''),
    case when new.raw_user_meta_data->>'role' = 'admin' then 'admin'::public.app_role else 'teacher'::public.app_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.materials enable row level security;

create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and is_active = true
  );
$$;

revoke all on function public.is_active_user() from public;
grant execute on function public.is_active_user() to authenticated;

create policy "profile_select_own" on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy "profile_update_own" on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "materials_select_own" on public.materials
for select to authenticated using (user_id = (select auth.uid()) and public.is_active_user());
create policy "materials_insert_own" on public.materials
for insert to authenticated with check (user_id = (select auth.uid()) and public.is_active_user());
create policy "materials_update_own" on public.materials
for update to authenticated using (user_id = (select auth.uid()) and public.is_active_user())
with check (user_id = (select auth.uid()) and public.is_active_user());
create policy "materials_delete_own" on public.materials
for delete to authenticated using (user_id = (select auth.uid()) and public.is_active_user());

revoke all on public.profiles from anon;
revoke all on public.materials from anon;
grant select on public.profiles to authenticated;
grant update (full_name, school_name, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.materials to authenticated;

commit;
