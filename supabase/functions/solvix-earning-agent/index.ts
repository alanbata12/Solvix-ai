import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async () => {
  const started = Date.now();

  try {
    const { data: opportunities, error } = await supabase
      .from("earning_opportunities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Unable to read opportunities: ${error.message}`);
    }

    const evaluated = (opportunities ?? []).map((opportunity) => {
      const estimatedRevenue =
        Number(
          opportunity.estimated_revenue ??
          opportunity.revenue ??
          opportunity.amount ??
          0,
        );

      const estimatedCost =
        Number(
          opportunity.estimated_cost ??
          opportunity.cost ??
          0,
        );

      const estimatedProfit = estimatedRevenue - estimatedCost;

      let decision = "REVIEW";

      if (estimatedProfit > 0) {
        decision = "QUALIFIED";
      } else if (estimatedProfit < 0) {
        decision = "REJECTED";
      }

      return {
        id: opportunity.id,
        title: opportunity.title ?? "Untitled opportunity",
        estimated_revenue: estimatedRevenue,
        estimated_cost: estimatedCost,
        estimated_profit: estimatedProfit,
        decision,
      };
    });

    const qualified = evaluated.filter(
      (item) => item.decision === "QUALIFIED",
    );

    const rejected = evaluated.filter(
      (item) => item.decision === "REJECTED",
    );

    const review = evaluated.filter(
      (item) => item.decision === "REVIEW",
    );

    const report = {
      agent: "Solvix Earning Agent",
      status: "SUCCESS",
      opportunities_evaluated: evaluated.length,
      qualified: qualified.length,
      rejected: rejected.length,
      review_required: review.length,
      qualified_opportunities: qualified,
      execution_time_ms: Date.now() - started,
      timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(report));

    return Response.json(report);
  } catch (error) {
    const report = {
      agent: "Solvix Earning Agent",
      status: "ERROR",
      error: error instanceof Error ? error.message : String(error),
      execution_time_ms: Date.now() - started,
      timestamp: new Date().toISOString(),
    };

    console.error(JSON.stringify(report));

    return Response.json(report, { status: 500 });
  }
});
