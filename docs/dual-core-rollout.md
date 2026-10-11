# Solvix dual-core rollout

## Included in this branch

- Keeps the existing Next.js/Supabase SSR authentication flow in `proxy.ts`.
- Adds server-side access checks for the `FOREX` and `AIL` verticals.
- Adds a database migration for per-user vertical subscriptions and sanitized AIL reports.
- Adds an AIL report workspace that displays stored, user-owned reports without inventing scan results.
- Adds a small Sentinel market-summary helper. It consumes supplied bars only and cannot execute trades.
- Adds Solvix SVG PWA icons. The existing manifest and app metadata remain in place.

## Required before testing protected verticals

1. Apply `supabase/migrations/202610120001_dual_core_access.sql` to the connected Supabase project.
2. Ensure a trusted server-side process creates subscription records only after verifying entitlement.
3. Confirm the billing page handles `vertical=FOREX` and `vertical=AIL` query parameters. No Stripe checkout or webhook behavior is added in this branch.
4. Test sign-in, onboarding redirects, users with no subscription, active subscriptions, and expired subscriptions in a preview environment.

## Stripe intentionally deferred

Stripe keys, checkout creation, webhook processing, and subscription provisioning are not changed here. When Stripe work begins, it should verify webhook signatures, persist event IDs idempotently, and update `user_subscriptions` only from verified Stripe events. The Supabase service-role key must remain server-side.

## Security boundaries

- RLS lets authenticated users read only their own subscription records and AIL reports.
- Clients receive no insert/update/delete policy for subscriptions or AIL reports.
- AIL report fields are intended for sanitized indicators and summaries; do not persist raw credentials, access tokens, or unredacted secret-bearing payloads.
- Sentinel output is descriptive only and is not financial advice or an instruction to trade.
