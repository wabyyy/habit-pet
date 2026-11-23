-- A 11/23–11/29: extend existing habits; keep the group's 12-table design.
alter table public.habits
  add column goal_type text not null default 'quantity',
  add column revision integer not null default 1,
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz not null default now(),
  add column request_id uuid,
  add constraint habits_goal_type_valid check (goal_type in ('check','quantity')),
  add constraint habits_check_target_valid check (goal_type <> 'check' or target_amount = 1),
  add constraint habits_revision_valid check (revision > 0);

create unique index habits_owner_request_unique on public.habits(user_id,request_id)
where request_id is not null;

-- Ordinary clients read their own data. Writes go through the validated transaction below.
revoke all on public.habits, public.habit_schedules, public.units from anon;
revoke insert,update,delete,truncate,references,trigger on public.habits,public.habit_schedules from authenticated;
grant select on public.habits, public.habit_schedules, public.units to authenticated;

create policy habits_select_owner on public.habits for select to authenticated
using ((select auth.uid()) = user_id);
create policy habit_schedules_select_owner on public.habit_schedules for select to authenticated
using (exists(select 1 from public.habits h where h.id=habit_id and h.user_id=(select auth.uid())));
create policy units_select_signed_in on public.units for select to authenticated using (true);

create function public.save_habit_settings(
  p_habit_id bigint,
  p_name text,
  p_time_slot text,
  p_icon text,
  p_goal_type text,
  p_target_amount numeric,
  p_unit_code text,
  p_weekdays smallint[],
  p_expected_revision integer,
  p_request_id uuid
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_habit public.habits%rowtype;
  v_unit_id bigint;
  v_days smallint[];
  v_target numeric;
  v_inserted boolean := false;
begin
  if v_actor is null then
    raise exception using errcode='42501',message='請先登入。';
  end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 40 then
    raise exception using errcode='22023',message='習慣名稱需要 1～40 個字。';
  end if;
  if p_time_slot is null or p_time_slot not in ('morning','noon','evening') then
    raise exception using errcode='22023',message='請選擇有效的早中晚時段。';
  end if;
  if p_icon is null or p_icon not in ('cup','book','dumbbell','leaf','pen','sun','headphones','plant','moon') then
    raise exception using errcode='22023',message='請選擇內建圖示。';
  end if;
  if p_goal_type is null or p_goal_type not in ('check','quantity') then
    raise exception using errcode='22023',message='目標類型無效。';
  end if;
  if p_weekdays is null or cardinality(p_weekdays) < 1 or cardinality(p_weekdays) > 7
     or exists(select 1 from unnest(p_weekdays) d where d is null or d < 1 or d > 7) then
    raise exception using errcode='22023',message='請選擇有效的重複日。';
  end if;
  select array_agg(distinct d order by d) into v_days from unnest(p_weekdays) d;
  if p_goal_type='check' then
    v_target:=1;
    select id into v_unit_id from public.units where code='count';
  else
    if p_target_amount is null or p_target_amount='NaN'::numeric
      or p_target_amount <= 0 or p_target_amount > 100000
      or round(p_target_amount,2)<>p_target_amount then
      raise exception using errcode='22023',message='目標量需大於 0，最多兩位小數，上限 100,000。';
    end if;
    v_target:=p_target_amount;
    select id into v_unit_id from public.units where code=p_unit_code;
  end if;
  if v_unit_id is null then
    raise exception using errcode='22023',message='計量單位不存在。';
  end if;
  if p_habit_id is null then
    if p_request_id is null then
      raise exception using errcode='22023',message='缺少建立請求識別碼。';
    end if;
    insert into public.habits(user_id,unit_id,name,icon,target_amount,time_slot,goal_type,request_id)
    values(v_actor,v_unit_id,btrim(p_name),p_icon,v_target,p_time_slot,p_goal_type,p_request_id)
    on conflict(user_id,request_id) where request_id is not null do nothing
    returning * into v_habit;
    v_inserted:=found;
    if not v_inserted then
      select * into v_habit from public.habits where user_id=v_actor and request_id=p_request_id;
    else
      insert into public.habit_schedules(habit_id,weekday) select v_habit.id,d from unnest(v_days) d;
    end if;
  else
    select * into v_habit from public.habits where id=p_habit_id and user_id=v_actor for update;
    if not found then
      raise exception using errcode='42501',message='習慣不存在或沒有操作權限。';
    end if;
    if p_expected_revision is null or p_expected_revision <> v_habit.revision then
      raise exception using errcode='40001',message='習慣已被更新，請重新開啟後再編輯。';
    end if;
    update public.habits set name=btrim(p_name),time_slot=p_time_slot,icon=p_icon,
      goal_type=p_goal_type,target_amount=v_target,unit_id=v_unit_id,
      revision=revision+1,updated_at=now()
    where id=v_habit.id and user_id=v_actor returning * into v_habit;
    delete from public.habit_schedules where habit_id=v_habit.id;
    insert into public.habit_schedules(habit_id,weekday) select v_habit.id,d from unnest(v_days) d;
  end if;
  return to_jsonb(v_habit) || jsonb_build_object(
    'id',v_habit.id::text,
    'habit_schedules',(select jsonb_agg(jsonb_build_object('weekday',s.weekday) order by s.weekday)
      from public.habit_schedules s where s.habit_id=v_habit.id),
    'units',(select jsonb_build_object('code',u.code,'name',u.name) from public.units u where u.id=v_habit.unit_id)
  );
end;
$$;
revoke all on function public.save_habit_settings(bigint,text,text,text,text,numeric,text,smallint[],integer,uuid) from public,anon;
grant execute on function public.save_habit_settings(bigint,text,text,text,text,numeric,text,smallint[],integer,uuid) to authenticated;
comment on function public.save_habit_settings(bigint,text,text,text,text,numeric,text,smallint[],integer,uuid)
is 'A habit settings: authenticated owner-only atomic save; server derives auth.uid(); validates inputs; idempotent creates; optimistic revision on updates. SECURITY DEFINER is intentional; public and anon execution is revoked.';
