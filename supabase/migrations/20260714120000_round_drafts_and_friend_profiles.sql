alter table public.rounds
  add column if not exists status text not null default 'completed',
  add column if not exists target_holes integer not null default 18,
  add column if not exists completed_at timestamptz;

alter table public.rounds
  drop constraint if exists rounds_status_check;

alter table public.rounds
  add constraint rounds_status_check
  check (status in ('draft', 'unfinished', 'completed'));

update public.rounds
set
  status = case
    when holes_played in (9, 18) then 'completed'
    else 'unfinished'
  end,
  target_holes = case
    when holes_played in (9, 18) then holes_played
    else 18
  end,
  completed_at = case
    when holes_played in (9, 18) then coalesce(completed_at, created_at)
    else completed_at
  end
where completed_at is null
   or target_holes = 18
   or status = 'completed';

create index if not exists idx_rounds_user_status_created_at
  on public.rounds (user_id, status, created_at desc);

create or replace function public.get_friend_profile(friend_user_id uuid)
returns table (
  user_id uuid,
  username text,
  display_name text,
  main_sport text,
  main_goal text,
  created_at timestamptz,
  relationship_label text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    p.id as user_id,
    p.username,
    case
      when p.show_display_name_in_search then p.full_name
      else null
    end as display_name,
    p.onboarding_data ->> 'mainSport' as main_sport,
    p.main_goal,
    p.created_at,
    case
      when fc.requester_id = auth.uid() then 'Friend'
      when fc.receiver_id = auth.uid() then 'Friend'
      else null
    end as relationship_label
  from public.profiles p
  join public.friend_connections fc
    on fc.status = 'accepted'
   and (
    (fc.requester_id = auth.uid() and fc.receiver_id = friend_user_id)
    or
    (fc.receiver_id = auth.uid() and fc.requester_id = friend_user_id)
   )
  where p.id = friend_user_id
  limit 1;
$$;

revoke all on function public.get_friend_profile(uuid) from public;
revoke all on function public.get_friend_profile(uuid) from anon;
grant execute on function public.get_friend_profile(uuid) to authenticated;
