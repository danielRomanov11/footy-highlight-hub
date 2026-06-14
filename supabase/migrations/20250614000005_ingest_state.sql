-- Tracks scheduled ingestion runs (traffic-driven, no platform cron)

create table ingest_state (
  id int primary key default 1,
  last_run_at timestamptz,
  last_run_started_at timestamptz,
  last_run_status text,
  last_error text,
  constraint ingest_state_singleton check (id = 1)
);

insert into ingest_state (id) values (1);

alter table ingest_state enable row level security;

grant all on table public.ingest_state to service_role;

create or replace function try_acquire_ingest_lock(p_interval interval default interval '2 hours')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update ingest_state
  set last_run_started_at = now()
  where id = 1
    and (last_run_at is null or last_run_at < now() - p_interval)
    and (
      last_run_started_at is null
      or last_run_at >= last_run_started_at
      or last_run_started_at < now() - interval '15 minutes'
    );

  return found;
end;
$$;

create or replace function complete_ingest_run(p_status text, p_error text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update ingest_state
  set
    last_run_at = now(),
    last_run_status = p_status,
    last_error = p_error
  where id = 1;
end;
$$;

grant execute on function try_acquire_ingest_lock(interval) to service_role;
grant execute on function complete_ingest_run(text, text) to service_role;
