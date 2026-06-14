-- Manual refresh bypasses the ingest interval (still blocks concurrent runs)

create or replace function try_acquire_ingest_lock(
  p_interval interval default interval '0 seconds',
  p_force boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update ingest_state
  set last_run_started_at = now()
  where id = 1
    and (
      p_force
      or p_interval <= interval '0 seconds'
      or last_run_at is null
      or last_run_at < now() - p_interval
    )
    and (
      last_run_started_at is null
      or last_run_at >= last_run_started_at
      or last_run_started_at < now() - interval '15 minutes'
    );

  return found;
end;
$$;

grant execute on function try_acquire_ingest_lock(interval, boolean) to service_role;
