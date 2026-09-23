# Solvix MCP Server

Real Model Context Protocol server for Solvix.

## Current release

Version 0.1.0 is intentionally read-only. It exposes:

- solvix_status
- github_get_file
- github_search_code

Write operations, deployments, Supabase mutations, and financial actions are disabled in this initial release.

## Local Cursor setup

From the repository:

    cd mcp
    npm install

Set a GitHub token in the environment used by Cursor:

    export GITHUB_TOKEN="your-github-token"

The project-level .cursor/mcp.json starts this server through npm. Cursor supports project-scoped MCP configuration and local stdio servers.

## HTTP mode

For a remote MCP endpoint:

    cd mcp
    npm install
    export GITHUB_TOKEN="your-github-token"
    export SOLVIX_MCP_API_KEY="a-long-random-secret"
    npm run http

The endpoint is:

    http://localhost:3000/mcp

For production, deploy the HTTP process behind HTTPS and replace API-key authentication with OAuth 2.1 before exposing it to ChatGPT or other users.

## Security

Never commit GITHUB_TOKEN or SOLVIX_MCP_API_KEY. Keep the initial connector read-only. Cursor asks for approval before MCP tool execution by default.
