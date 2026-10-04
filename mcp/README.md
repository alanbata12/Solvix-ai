# Solvix MCP Server

Remote MCP gateway for Grok and local MCP clients.

## Remote Grok connector

The Vercel project `solvix-grok-mcp` deploys `api/mcp.ts` as a public HTTPS MCP endpoint. It authenticates callers with the server-side `SOLVIX_MCP_API_KEY`.

Capabilities:
- `solvix_status`
- `github_get_file`
- `github_search_code`
- `github_create_branch`
- `github_write_file`
- `github_delete_file`
- `vercel_deployments`
- `vercel_deployment_events`
- `solvix_backend_request`

Credentials are server-side environment variables and are never returned by the tools.

## Grok

In Grok, open Connectors -> New Connector -> Custom and enter the deployed MCP URL ending in `/api/mcp`. Authenticate with the bearer credential configured for the connector.

For Grok CLI, the equivalent remote MCP configuration is:

    grok mcp add --transport http solvix https://YOUR-MCP-DOMAIN/api/mcp --header "Authorization: Bearer YOUR_MCP_KEY"

## Environment variables

Required:
- `SOLVIX_MCP_API_KEY`

Optional capabilities:
- `GITHUB_TOKEN`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `SOLVIX_BACKEND_URL`
- `SOLVIX_BACKEND_TOKEN`

Never commit these secrets.

## Local mode

The existing `server.ts` remains available for local stdio MCP clients.
