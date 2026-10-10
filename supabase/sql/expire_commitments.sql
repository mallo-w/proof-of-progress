-- Expire 'active' commitments whose deadline passed without proof (stake forfeited).
-- Run once in the Supabase SQL Editor. Requires pg_cron (already enabled).

-- 1. Fix existing stale rows immediately
update commitments
set status = 'expired'
where status = 'active' and deadline < now();

-- 2. Re-check every hour
select cron.schedule(
  'expire-overdue-commitments',
  '0 * * * *',
  $$ update commitments set status = 'expired' where status = 'active' and deadline < now(); $$
);
