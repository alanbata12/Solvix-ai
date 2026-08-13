import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

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

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "POST required" }, 405);
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

    // Safe diagnostic repair: re-read recent security memory without changing it.
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
