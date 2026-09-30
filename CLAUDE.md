# Solvix — Claude Code Execution Contract

## Mission

Finish the Solvix platform end-to-end. Work directly in this repository and make actual code/configuration changes. Do not merely describe fixes.

The authoritative project checklist is `SOLVIX_CURSOR_HANDOFF.md`. Treat it as the definition of done and follow its required order.

## Required workflow

1. Inventory the repository and identify production entrypoints.
2. Audit and repair the frontend.
3. Audit and repair Supabase/database integration, migrations, RLS, Edge Functions, authentication, and persistence.
4. Audit every Solvix agent and orchestration path. Remove placeholder/demo behavior.
5. Ensure dashboard values come from persisted, verifiable data. Never fabricate earnings, payments, users, metrics, or agent states.
6. Verify cloud scheduling/background execution so Solvix does not depend on a developer's local machine.
7. Add or repair health checks, structured logging, retries, idempotency, and failure recovery where needed.
8. Verify payment/treasury accounting. Only verified received payments count as revenue.
9. Preserve human approval gates for security-sensitive submissions and withdrawal-destination changes.
10. Run tests and a production build. Fix failures rather than working around them.
11. Commit coherent, tested changes and push them to the intended production branch.
12. Verify deployment and runtime behavior before declaring completion.

## Operating rules

- Inspect existing code before replacing it.
- Prefer small, testable changes over rewrites.
- Do not introduce fake/mock financial data into production paths.
- Do not commit secrets, API keys, service-role keys, OAuth tokens, or credentials.
- Use environment variables/secrets for credentials.
- Never claim a test, build, deployment, database operation, or external integration succeeded unless it was actually verified.
- If a dependency, credential, external account, or infrastructure resource is genuinely unavailable, document the exact blocker and continue with all work that can be completed safely.
- Keep authentication and authorization boundaries intact.
- Treat financial operations and security-sensitive actions as high-risk and retain required human approval.
- After each major repair, run the narrowest relevant test/build before moving on.
- At the end, provide a concise change log, verification results, remaining blockers, and exact deployment status.

## Claude / 9Router

Claude Code may use an OpenAI-compatible local 9Router endpoint when configured by the execution environment. 9Router is a routing layer; it does not create unlimited provider quota. Respect the actual limits and authentication of every upstream provider.

## Completion standard

Do not stop at a visually complete frontend. Solvix is complete only when the frontend, backend, database, authentication, agents, scheduled execution, integrations, and deployment paths have been tested and verified together.

If the repository's existing handoff conflicts with an implementation detail, preserve the handoff's safety and verification requirements and document the discrepancy.
