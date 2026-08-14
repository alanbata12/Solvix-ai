import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CODE_AGENT_KEY = Deno.env.get("SOLVIX_CODE_AGENT_KEY");

const SAFE_REPAIRS = [
  "CLEAR_EXPIRED_BLOCKS",
  "RECHECK_SECURITY_MEMORY",
] as const;

type SafeRepair = (typeof SAFE_REPAIRS)[number];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// Hash both values before comparing so the raw secret is never logged or
// compared directly. This is a small defense against timing side channels.
const tokenDigest = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
};

const sameBytes = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

const authorized = async (req: Request) => {
  if (!CODE_AGENT_KEY) return false;
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const supplied = header.slice("Bearer ".length).trim();
  if (!supplied) return false;

  const [expected, actual] = await Promise.all([
    tokenDigest(CODE_AGENT_KEY),
    tokenDigest(supplied),
  ]);
  return sameBytes(expected, actual);
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "POST required" }, 405);
  }

  if (!CODE_AGENT_KEY) {
    return json({
      status: "CONFIGURATION_ERROR",
      error: "SOLVIX_CODE_AGENT_KEY is not configured",
    }, 503);
  }

  if (!(await authorized(req))) {
    return json({ status: "UNAUTHORIZED" }, 401);
  }

  const body = await req.json().catch(() => ({}));
  const repair = body?.repair as string | undefined;

  if (!repair || !SAFE_REPAIRS.includes(repair as SafeRepair)) {
    return json(
      {
        status: "REJECTED",
        allowed_repairs: SAFE_REPAIRS,
      },
      403,
    );
  }

  const started = Date.now();

  try {
    if (repair === "CLEAR_EXPIRED_BLOCKS") {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("security_blocks")
        .update({ active: false })
        .eq("active", true)
        .lte("blocked_until", now)
        .select("source, blocked_until");

      if (error) {
        throw new Error(`Unable to clear expired blocks: ${error.message}`);
      }

      return json({
        status: "COMPLETED",
        repair,
        repaired_count: data?.length ?? 0,
        execution_time_ms: Date.now() - started,
        timestamp: new Date().toISOString(),
      });
    }

    if (repair === "RECHECK_SECURITY_MEMORY") {
      const { data, error } = await supabase
        .from("security_events")
        .select("created_at, source, endpoint, risk, action")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(`Unable to recheck security memory: ${error.message}`);
      }

      const events = data ?? [];
      const highRisk = events.filter(
        (event) => event.risk === "HIGH" || event.risk === "CRITICAL",
      ).length;
      const blocked = events.filter(
        (event) =>
          event.action === "BLOCKED" || event.action === "TEMPORARY_BLOCK",
      ).length;

      return json({
        status: "COMPLETED",
        repair,
        memory_checked: events.length,
        high_risk_events: highRisk,
        blocked_events: blocked,
        execution_time_ms: Date.now() - started,
        timestamp: new Date().toISOString(),
      });
    }

    return json({ status: "REJECTED", allowed_repairs: SAFE_REPAIRS }, 403);
  } catch (error) {
    return json(
      {
        status: "ERROR",
        repair,
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});
