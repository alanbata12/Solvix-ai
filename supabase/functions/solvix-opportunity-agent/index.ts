import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const AGENT = "solvix-opportunity-agent";

Deno.serve(async () => {
  const started = Date.now();

  try {
    await supabase.from("agent_heartbeats").upsert({
      agent: AGENT,
      status: "RUNNING",
      last_started_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "agent" });

    const { data: opportunities, error: readError } = await supabase
      .from("earning_opportunities")
      .select("id,title,description,category,reward,currency,active,source_name,source_url,external_id,decision,created_at")
      .eq("active", true)
      .not("source_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    if (readError) throw new Error(`Unable to read opportunities: ${readError.message}`);

    const candidates = (opportunities ?? []).filter((o) =>
      String(o.category ?? "").toLowerCase().includes("job") ||
      String(o.category ?? "").toLowerCase().includes("lead") ||
      Boolean(o.source_url)
    );

    let inserted = 0;

    for (const o of candidates) {
      if (!o.source_url || !o.title) continue;

      const { data: existing, error: existingError } = await supabase
        .from("job_leads")
        .select("id")
        .eq("source_url", o.source_url)
        .limit(1);

      if (existingError) throw new Error(`Unable to check job lead: ${existingError.message}`);
      if (existing?.length) continue;

      const payout =
        String(o.currency ?? "").toUpperCase() === "USD" && Number(o.reward ?? 0) > 0
          ? Number(o.reward)
          : null;

      const { error: insertError } = await supabase.from("job_leads").insert({
        title: o.title,
        client_region: "GLOBAL",
        expected_payout_usd: payout,
        lead_price_usd: null,
        difficulty: "Unspecified",
        required_skills: [String(o.category ?? "remote work")],
        source_name: o.source_name ?? "Solvix opportunity source",
        source_url: o.source_url,
        is_verified: Boolean(o.source_name && o.source_url),
      });

      if (insertError) throw new Error(`Unable to create job lead: ${insertError.message}`);
      inserted++;
    }

    const now = new Date().toISOString();
    const { error: heartbeatError } = await supabase.from("agent_heartbeats").upsert({
      agent: AGENT,
      status: "SUCCESS",
      last_finished_at: now,
      last_success_at: now,
      last_error: null,
      runs: 1,
      successes: 1,
      failures: 0,
      opportunities_found: candidates.length,
      updated_at: now,
    }, { onConflict: "agent" });

    if (heartbeatError) throw new Error(`Unable to update heartbeat: ${heartbeatError.message}`);

    return Response.json({
      agent: AGENT,
      status: "SUCCESS",
      opportunities_seen: candidates.length,
      job_leads_inserted: inserted,
      execution_time_ms: Date.now() - started,
      timestamp: now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const now = new Date().toISOString();

    await supabase.from("agent_heartbeats").upsert({
      agent: AGENT,
      status: "ERROR",
      last_finished_at: now,
      last_error: message,
      runs: 1,
      failures: 1,
      updated_at: now,
    }, { onConflict: "agent" });

    return Response.json({
      agent: AGENT,
      status: "ERROR",
      error: message,
      execution_time_ms: Date.now() - started,
      timestamp: now,
    }, { status: 500 });
  }
});
