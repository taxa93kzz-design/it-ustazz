begin;

alter table public.profiles
  add column if not exists subscription_status text not null default 'trial'
    check (subscription_status in ('trial', 'active', 'expired')),
  add column if not exists trial_generations_used integer not null default 0
    check (trial_generations_used between 0 and 2),
  add column if not exists subscription_expires_at timestamptz;

create or replace function public.claim_ai_generation()
returns table (
  allowed boolean,
  remaining integer,
  current_status text,
  charged boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_row public.profiles%rowtype;
  next_used integer;
begin
  select * into profile_row
  from public.profiles
  where id = (select auth.uid())
  for update;

  if profile_row.id is null or not profile_row.is_active then
    return query select false, 0, 'blocked'::text, false;
    return;
  end if;

  if profile_row.role = 'admin' then
    return query select true, -1, 'active'::text, false;
    return;
  end if;

  if profile_row.subscription_status = 'active'
     and (profile_row.subscription_expires_at is null or profile_row.subscription_expires_at > now()) then
    return query select true, -1, 'active'::text, false;
    return;
  end if;

  if profile_row.trial_generations_used < 2 then
    next_used := profile_row.trial_generations_used + 1;
    update public.profiles
      set trial_generations_used = next_used,
          subscription_status = 'trial'
      where id = profile_row.id;
    return query select true, 2 - next_used, 'trial'::text, true;
    return;
  end if;

  update public.profiles
    set subscription_status = 'expired'
    where id = profile_row.id and subscription_status <> 'expired';
  return query select false, 0, 'expired'::text, false;
end;
$$;

create or replace function public.refund_ai_generation(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set trial_generations_used = greatest(trial_generations_used - 1, 0),
      subscription_status = 'trial'
  where id = target_user and subscription_status <> 'active';
end;
$$;

revoke all on function public.claim_ai_generation() from public;
grant execute on function public.claim_ai_generation() to authenticated;
revoke all on function public.refund_ai_generation(uuid) from public;
grant execute on function public.refund_ai_generation(uuid) to service_role;

commit;
