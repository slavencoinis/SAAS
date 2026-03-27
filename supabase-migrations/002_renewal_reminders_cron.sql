-- Enable pg_cron and pg_net extensions (must be done in Supabase dashboard
-- under Database > Extensions if not already enabled)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule daily renewal reminders at 08:00 UTC
-- Requires app.supabase_url and app.service_role_key to be set as DB settings
-- Set them via: ALTER DATABASE postgres SET app.supabase_url = 'https://xxx.supabase.co';
--              ALTER DATABASE postgres SET app.service_role_key = 'your-service-role-key';

select cron.schedule(
  'send-renewal-reminders',
  '0 8 * * *',
  $$
  select net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/send-renewal-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type',  'application/json'
    ),
    body    := '{}'::jsonb
  )
  $$
);
