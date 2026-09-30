revoke execute on function public.handle_new_user_profile() from public, anon, authenticated;
revoke execute on function public.reap_stuck_yta_runs() from public, anon, authenticated;
alter function public.set_customer_job_selection_updated_at() set search_path = public;
