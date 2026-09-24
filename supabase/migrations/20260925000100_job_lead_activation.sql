create schema if not exists solvix_internal;

create or replace function solvix_internal.activation_cycle()
returns jsonb
language plpgsql
security definer
set search_path = public, solvix_internal
as $$
declare
  inserted_count integer := 0;
  seen_count integer := 0;
begin
  insert into public.agent_heartbeats (agent,status,last_started_at,runs,successes,failures,opportunities_found,updated_at)
  values ('solvix-job-lead-activation','RUNNING',now(),1,0,0,0,now())
  on conflict (agent) do update set status='RUNNING',last_started_at=now(),runs=public.agent_heartbeats.runs+1,updated_at=now();

  select count(*) into seen_count from public.earning_opportunities where active=true and source_url is not null;

  insert into public.job_leads (title,client_region,expected_payout_usd,lead_price_usd,difficulty,required_skills,source_name,source_url,is_verified)
  select eo.title,'GLOBAL',
    case when upper(coalesce(eo.currency,''))='USD' and coalesce(eo.reward,0)>0 then eo.reward else null end,
    null,'Mid',array[coalesce(eo.category,'remote work')]::text[],
    coalesce(eo.source_name,'Solvix opportunity source'),eo.source_url,
    (eo.source_name is not null and eo.source_url is not null)
  from public.earning_opportunities eo
  where eo.active=true and eo.source_url is not null
    and not exists (select 1 from public.job_leads jl where jl.source_url=eo.source_url)
  order by eo.created_at desc limit 100;

  get diagnostics inserted_count = row_count;

  update public.agent_heartbeats
  set status='SUCCESS',last_finished_at=now(),last_success_at=now(),
      successes=successes+1,opportunities_found=seen_count,last_error=null,updated_at=now()
  where agent='solvix-job-lead-activation';

  return jsonb_build_object('ok',true,'agent','solvix-job-lead-activation','opportunities_seen',seen_count,'job_leads_inserted',inserted_count,'at',now());
exception when others then
  update public.agent_heartbeats
  set status='ERROR',last_finished_at=now(),failures=failures+1,last_error=sqlerrm,updated_at=now()
  where agent='solvix-job-lead-activation';
  raise;
end;
$$;

revoke all on function solvix_internal.activation_cycle() from public;

select cron.unschedule(jobid) from cron.job where jobname='solvix-job-lead-activation-every-5-minutes';

select cron.schedule('solvix-job-lead-activation-every-5-minutes','*/5 * * * *',$$select solvix_internal.activation_cycle();$$);
