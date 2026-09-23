import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPO = "alanbata12/Solvix-ai";
const GITHUB_API = "https://api.github.com";

function cors(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version");
  headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  headers.set("Access-Control-Expose-Headers", "Mcp-Session-Id, MCP-Protocol-Version");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": "Bearer", "Content-Type": "text/plain" },
  });
}

function authorized(request: Request) {
  const configured = process.env.SOLVIX_MCP_API_KEY;
  if (!configured) return false;
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${configured}`;
}

async function github(path: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured on the MCP server.");
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${data?.message ?? "request failed"}`);
  return data;
}

const handler = createMcpHandler(() => {
  const server = new McpServer(
    { name: "solvix-mcp", version: "0.1.0" },
    {
      instructions:
        "Solvix MCP provides controlled access to the Solvix repository. Read project status and files before proposing changes. Production writes and deployments require explicit authorization.",
    },
  );

  server.registerTool(
    "solvix_status",
    {
      description: "Return the Solvix MCP server status and configured integration capabilities.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            ok: true,
            service: "solvix-mcp",
            version: "0.1.0",
            repository: REPO,
            githubConfigured: Boolean(process.env.GITHUB_TOKEN),
            writeMode: false,
          }),
        },
      ],
    }),
  );

  server.registerTool(
    "github_get_file",
    {
      description: "Read a text file from the Solvix GitHub repository. Defaults to main.",
      inputSchema: z.object({
        path: z.string().min(1),
        ref: z.string().default("main"),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ path, ref }) => {
      const encoded = path.split("/").map(encodeURIComponent).join("/");
      const data = await github(`/repos/${REPO}/contents/${encoded}?ref=${encodeURIComponent(ref)}`);
      if (Array.isArray(data) || data.type !== "file") {
        throw new Error("The requested path is not a single file.");
      }
      const content = Buffer.from(data.content ?? "", "base64").toString("utf8");
      return {
        content: [{ type: "text", text: JSON.stringify({ path, ref, sha: data.sha, content }) }],
      };
    },
  );

  server.registerTool(
    "github_search_code",
    {
      description: "Search the Solvix repository for code or configuration text.",
      inputSchema: z.object({ query: z.string().min(1) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ query }) => {
      const data = await github(`/search/code?q=${encodeURIComponent(`${query} repo:${REPO}`)}`);
      return {
        content: [{ type: "text", text: JSON.stringify(data.items ?? []) }],
      };
    },
  );

  return server;
});

async function handle(request: Request) {
  if (request.method === "OPTIONS") {
    return cors(new Response(null, { status: 204 }));
  }
  if (!authorized(request)) return cors(unauthorized());
  return cors(await handler.fetch(request));
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

export async function DELETE(request: Request) {
  return handle(request);
}

export async function OPTIONS(request: Request) {
  return handle(request);
}
