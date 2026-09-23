import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createServer } from "node:http";
import * as z from "zod/v4";

const REPO = "alanbata12/Solvix-ai";
const GITHUB_API = "https://api.github.com";

function registerTools(server: McpServer) {
  server.registerTool("solvix_status", {
    description: "Return Solvix MCP service status and enabled capabilities.",
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async () => ({
    content: [{ type: "text", text: JSON.stringify({
      ok: true,
      service: "solvix-mcp",
      version: "0.1.0",
      repository: REPO,
      githubConfigured: Boolean(process.env.GITHUB_TOKEN),
      writeMode: false
    }) }]
  }));

  server.registerTool("github_get_file", {
    description: "Read a text file from the Solvix GitHub repository.",
    inputSchema: z.object({
      path: z.string().min(1),
      ref: z.string().default("main")
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ path, ref }) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not configured.");

    const encoded = path.split("/").map(encodeURIComponent).join("/");
    const url = GITHUB_API + "/repos/" + REPO + "/contents/" + encoded + "?ref=" + encodeURIComponent(ref);
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error("GitHub API " + response.status + ": " + (data?.message ?? "request failed"));
    if (Array.isArray(data) || data.type !== "file") throw new Error("The requested path is not a single file.");

    const content = Buffer.from(data.content ?? "", "base64").toString("utf8");
    return {
      content: [{ type: "text", text: JSON.stringify({ path, ref, sha: data.sha, content }) }]
    };
  });

  server.registerTool("github_search_code", {
    description: "Search the Solvix repository for code or configuration text.",
    inputSchema: z.object({ query: z.string().min(1) }),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false }
  }, async ({ query }) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN is not configured.");

    const q = encodeURIComponent(query + " repo:" + REPO);
    const response = await fetch(GITHUB_API + "/search/code?q=" + q, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + token,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error("GitHub API " + response.status + ": " + (data?.message ?? "request failed"));

    return { content: [{ type: "text", text: JSON.stringify(data.items ?? []) }] };
  });
}

function createServerInstance() {
  const server = new McpServer(
    { name: "solvix-mcp", version: "0.1.0" },
    { instructions: "Solvix MCP gives AI agents controlled access to the Solvix repository. Read status and files before proposing changes. Production writes and deployments are disabled in this initial release." }
  );
  registerTools(server);
  return server;
}

async function runStdio() {
  const server = createServerInstance();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function runHttp() {
  const apiKey = process.env.SOLVIX_MCP_API_KEY;
  if (!apiKey) throw new Error("SOLVIX_MCP_API_KEY is required for HTTP mode.");

  const handler = createMcpHandler(createServerInstance);
  const nodeHandler = toNodeHandler(handler);
  const port = Number(process.env.PORT ?? 3000);

  const httpServer = createServer(async (req, res) => {
    if (req.url !== "/mcp") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }

    if (req.headers.authorization !== "Bearer " + apiKey) {
      res.writeHead(401, {
        "Content-Type": "text/plain",
        "WWW-Authenticate": "Bearer"
      });
      res.end("Unauthorized");
      return;
    }

    await nodeHandler(req, res);
  });

  httpServer.listen(port, () => {
    console.error("Solvix MCP listening on http://localhost:" + port + "/mcp");
  });
}

if (process.env.SOLVIX_MCP_TRANSPORT === "http") {
  await runHttp();
} else {
  await runStdio();
}
