# Solvix Code Agent

Solvix Code Agent is a controlled coding-repair Edge Function. It uses a Claude-family model through Vercel AI Gateway, reads selected repository files, diagnoses build/runtime errors, and—when confidence is high—creates a separate repair branch with proposed file changes.

## Required secrets

Set these in the Supabase Edge Function environment:

- `AI_GATEWAY_API_KEY` — Vercel AI Gateway credential.
- `GITHUB_TOKEN` — GitHub token with only the repository permissions needed to read files and create/update branches.
- `SOLVIX_CODE_AGENT_KEY` — private bearer key used to authorize callers of this function.

Optional:

- `GITHUB_REPO` — defaults to `alanbata12/Solvix-ai`.
- `GITHUB_BASE_BRANCH` — defaults to `main`.
- `SOLVIX_CODE_AGENT_MODEL` — defaults to `anthropic/claude-sonnet-4.5`.

## Request

POST JSON:

```json
{
  "mode": "repair",
  "error": "Vercel build error text",
  "files": ["path/to/relevant/file.ts"]
}
```

Use `mode: "diagnose"` when you want analysis without changing GitHub.

## Safety model

- Production `main` is never modified directly by the agent.
- Automatic repair requires model confidence of at least `0.75`.
- A repair is written to a new `repair/solvix-*` branch.
- Maximum 5 files may be changed in one automatic repair.
- The agent is instructed not to add secrets, fake financial data, bypasses, or unauthorized security behavior.
- Vercel/CI verification should run before merging a repair branch.

This design follows the tool-using coding-agent pattern: model + repository tools + verification + controlled changes. Vercel AI Gateway supports Anthropic models through a unified model interface, while the AI SDK provides tool/agent primitives and sandbox tooling. 
