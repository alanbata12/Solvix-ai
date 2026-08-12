import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async () => {
  const started = Date.now();

  try {
    // Read existing opportunities so the agent can avoid
    // immediately creating duplicate candidates.
    const { data: existing, error: readError } = await supabase
      .from("earning_opportunities")
      .select("title, source, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (readError) {
      throw new Error(`Unable to read earning opportunities: ${readError.message}`);
    }

    // Initial discovery candidates.
    // External discovery sources can be connected here later.
    const candidates = [
      {
        title: "Freelance software development opportunities",
        source: "Solvix Discovery",
        status: "DISCOVERED",
      },
      {
        title: "AI automation service opportunities",
        source: "Solvix Discovery",
        status: "DISCOVERED",
      },
      {
        title: "Digital product opportunities",
        source: "Solvix Discovery",
        status: "DISCOVERED",
      },
    ];

    const existingKeys = new Set(
      (existing ?? []).map(
        (item) => `${item.title}|${item.source}`,
      ),
    );

    const newCandidates = candidates.filter(
      (candidate) =>
        !existingKeys.has(`${candidate.title}|${candidate.source}`),
    );

    let inserted = 0;

    if (newCandidates.length > 0) {
      const { error: insertError } = await supabase
        .from("earning_opportunities")
        .insert(newCandidates);

      if (insertError) {
        throw new Error(
          `Unable to save opportunities: ${insertError.message}`,
        );
      }

      inserted = newCandidates.length;
    }

    const report = {
      agent: "Solvix Opportunity Discovery Agent",
      status: "SUCCESS",
      discovered: candidates.length,
      new_opportunities: inserted,
      duplicates_skipped: candidates.length - inserted,
      execution_time_ms: Date.now() - started,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(report));

    return Response.json(report);
  } catch (error) {
    const report = {
      agent: "Solvix Opportunity Discovery Agent",
      status: "ERROR",
      error: error instanceof Error ? error.message : String(error),
      execution_time_ms: Date.now() - started,
      timestamp: new Date().toISOString(),
    };

    console.error(JSON.stringify(report));

    return Response.json(report, { status: 500 });
  }
});
