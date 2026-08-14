# Solvix — Cursor/Vercel Handoff

## Mission
Audit, repair, test, and deploy the complete Solvix platform. Do not treat the dashboard as proof of operation. Verify the backend, agents, database, scheduling, integrations, authentication, and revenue ledger.

## Required order
1. Inventory the entire repository and identify the production entrypoints.
2. Find and fix build/runtime/deployment blockers.
3. Audit Supabase/database integration, RLS, Edge Functions, auth, and persistence.
4. Audit every Solvix agent and the orchestration layer; remove placeholder/demo implementations.
5. Make dashboard values come from persisted real data; never fabricate earnings.
6. Add/repair cloud scheduling/background execution so Solvix does not depend on a local PC.
7. Add health checks, structured logging, retries, idempotency, and failure recovery.
8. Verify payment/treasury accounting; only verified received payments count as revenue.
9. Preserve human approval gates for security-sensitive submissions and withdrawal-destination changes.
10. Run tests and production build; fix failures before deployment.
11. Commit tested changes and push to the production branch connected to Vercel.
12. Verify the resulting Vercel deployment and report the exact URL/status.

## Security boundaries
- Security research must remain limited to published/authorized program scope.
- Never bypass program restrictions or perform unauthorized testing.
- Never fabricate findings, evidence, accepted reports, payments, or revenue.
- Never commit secrets.
- Never automatically submit a HackerOne report where human review is required.

## Deployment requirement
The current BountyPay deployment showed a successful static Vercel deployment, but the dashboard was hard-coded and not connected to a live earning backend. Solvix must deploy the functional application, not another static demo.

## Definition of done
READY means: production build passes; tests pass; database/API connectivity works; agents execute through real job paths; scheduled execution is configured; dashboard reads persisted data; authentication/security boundaries work; deployment is verified; no fake financial data exists.

Cursor should make actual repository changes, run tests/builds, commit them, and push. Do not merely provide instructions. Do not claim deployment success unless verified.
