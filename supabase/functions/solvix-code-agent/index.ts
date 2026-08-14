import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateText } from "npm:ai@6";
import { gateway } from "npm:@ai-sdk/gateway@3";

const REPO = Deno.env.get("GITHUB_REPO") ?? "alanbata12/Solvix-ai";
const BASE_BRANCH = Deno.env.get("GITHUB_BASE_BRANCH") ?? "main";
const AGENT_KEY = Deno.env.get("SOLVIX_CODE_AGENT_KEY");
const MODEL = Deno.env.get("SOLVIX_CODE_AGENT_MODEL") ?? "anthropic/claude-sonnet-4.6";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
function authorized(req: Request) { return Boolean(AGENT_KEY) && req.headers.get("Authorization") === `Bearer ${AGENT_KEY}`; }
function githubPath(path: string) { return path.split("/").map(encodeURIComponent).join("/"); }
function decodeBase64Utf8(value: string) { const binary = atob(value.replace(/\n/g, "")); const bytes = Uint8Array.from(binary, c => c.charCodeAt(0)); return new TextDecoder().decode(bytes); }
function encodeBase64Utf8(value: string) { const bytes = new TextEncoder().encode(value); let binary = ""; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(binary); }

async function github(path: string, init: RequestInit = {}) {
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not configured");
  const response = await fetch(`https://api.github.com${path}`, { ...init, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${GITHUB_TOKEN}`, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${JSON.stringify(data)}`);
  return data;
}
async function readFile(path: string, ref: string) {
  const data = await github(`/repos/${REPO}/contents/${githubPath(path)}?ref=${encodeURIComponent(ref)}`);
  if (data.type !== "file") throw new Error(`${path} is not a file`);
  return { path, sha: data.sha as string, content: decodeBase64Utf8(String(data.content)) };
}
function normalizeCodePenDiagnostics(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const text = (key: string, max: number) => String(source[key] ?? "").slice(0, max);
  const list = (key: string, maxItems: number, maxChars: number) => Array.isArray(source[key]) ? source[key].filter(v => typeof v === "string").slice(0, maxItems).map(v => v.slice(0, maxChars)) : [];
  return { pen_url: text("pen_url", 500), console_errors: list("console_errors", 50, 2000), build_errors: list("build_errors", 50, 2000), warnings: list("warnings", 50, 1000), browser_errors: list("browser_errors", 50, 2000), screenshot_note: text("screenshot_note", 2000) };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  if (!authorized(req)) return json({ error: "Unauthorized" }, 401);
  if (!Deno.env.get("AI_GATEWAY_API_KEY")) return json({ error: "AI_GATEWAY_API_KEY is not configured" }, 503);
  const started = Date.now();
  try {
    const body = await req.json();
    const error = String(body?.error ?? "").trim();
    const paths = Array.isArray(body?.files) ? body.files.filter((p: unknown) => typeof p === "string") : [];
    const requestedMode = body?.mode === "diagnose" ? "diagnose" : "repair";
    const codepen = normalizeCodePenDiagnostics(body?.codepen);
    if (!error && !codepen) return json({ error: "error or codepen diagnostics are required" }, 400);
    if (paths.length > 8) return json({ error: "At most 8 files may be inspected per run" }, 400);
    const files = []; for (const path of paths) files.push(await readFile(path, BASE_BRANCH));

    const prompt = `You are Solvix Code Agent, a production software-repair agent with a Claude-style coding workflow.
Repository: ${REPO}\nBase branch: ${BASE_BRANCH}\nMode: ${requestedMode}
Deployment/build/runtime error:\n${error || "No standalone error; inspect CodePen diagnostics."}
CodePen frontend diagnostics:\n${codepen ? JSON.stringify(codepen, null, 2) : "None"}
Files:\n${files.map(f => `--- ${f.path} ---\n${f.content}`).join("\n")}
Rules: diagnose from supplied evidence; do not invent APIs/files/CodePen output; treat CodePen diagnostics as frontend evidence; preserve behavior; never add secrets, fake financial data, bypasses, or unauthorized security behavior; prefer the smallest safe fix; if insufficient evidence return no changes. Return ONLY JSON: {"diagnosis":string,"confidence":number,"changes":[{"path":string,"content":string,"reason":string}],"verification":[string],"needs_more_context":boolean,"context_needed":[string]}. confidence 0..1. Diagnose mode must have empty changes.`;

    const result = await generateText({ model: gateway(MODEL), prompt, temperature: 0 });
    const cleaned = result.text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const plan = JSON.parse(cleaned);
    if (!Array.isArray(plan.changes)) throw new Error("Agent returned invalid changes");
    if (requestedMode === "diagnose" || plan.needs_more_context) return json({ status: "DIAGNOSED", model: MODEL, repository: REPO, branch: BASE_BRANCH, codepen_received: Boolean(codepen), ...plan, execution_time_ms: Date.now() - started });
    if (plan.changes.length > 5) throw new Error("Agent proposed more than 5 file changes");
    if (plan.confidence < 0.75) return json({ status: "REVIEW_REQUIRED", reason: "Confidence below automatic-repair threshold", model: MODEL, ...plan, execution_time_ms: Date.now() - started }, 409);

    const branch = `repair/solvix-${Date.now()}`;
    const base = await github(`/repos/${REPO}/git/ref/heads/${encodeURIComponent(BASE_BRANCH)}`);
    await github(`/repos/${REPO}/git/refs`, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }) });
    const changed = [];
    for (const change of plan.changes) {
      if (typeof change.path !== "string" || typeof change.content !== "string") throw new Error("Invalid change returned by agent");
      const current = await readFile(change.path, BASE_BRANCH);
      const updated = await github(`/repos/${REPO}/contents/${githubPath(change.path)}`, { method: "PUT", body: JSON.stringify({ message: `fix: Solvix Code Agent repair ${change.path}`, content: encodeBase64Utf8(change.content), sha: current.sha, branch }) });
      changed.push({ path: change.path, sha: updated.content?.sha, reason: change.reason });
    }
    return json({ status: "REPAIR_BRANCH_CREATED", model: MODEL, repository: REPO, branch, base_branch: BASE_BRANCH, codepen_received: Boolean(codepen), diagnosis: plan.diagnosis, confidence: plan.confidence, changes: changed, verification: plan.verification, next_step: "Run CI/Vercel preview verification before merging to production.", execution_time_ms: Date.now() - started, timestamp: new Date().toISOString() });
  } catch (error) { return json({ status: "ERROR", error: error instanceof Error ? error.message : String(error), execution_time_ms: Date.now() - started, timestamp: new Date().toISOString() }, 500); }
});
