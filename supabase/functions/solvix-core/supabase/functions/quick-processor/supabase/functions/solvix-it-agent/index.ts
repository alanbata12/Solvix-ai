import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    Deno.serve(async () => {
      const started = Date.now();

        const { data: recentEvents, error } = await supabase
            .from("security_events")
                .select("created_at, source, endpoint, risk, action, details")
                    .order("created_at", { ascending: false })
                        .limit(20);

                          if (error) {
                              return new Response(
                                    JSON.stringify({
                                            agent: "Solvix IT Agent",
                                                    status: "ERROR",
                                                            diagnosis: "Unable to read security events",
                                                                    error: error.message
                                                                          }),
                                                                                {
                                                                                        status: 500,
                                                                                                headers: { "Content-Type": "application/json" }
                                                                                                      }
                                                                                                          );
                                                                                                            }

                                                                                                              const events = recentEvents || [];

                                                                                                                const highRisk = events.filter(
                                                                                                                    (e) => e.risk === "HIGH" || e.risk === "CRITICAL"
                                                                                                                      );

                                                                                                                        const blocked = events.filter(
                                                                                                                            (e) => e.action === "BLOCKED" ||
                                                                                                                                       e.action === "TEMPORARY_BLOCK"
                                                                                                                                         );

                                                                                                                                           let health = "HEALTHY";
                                                                                                                                             let diagnosis = "No significant security problems detected.";
                                                                                                                                               let recommendation = "Continue normal monitoring.";

                                                                                                                                                 if (highRisk.length >= 5) {
                                                                                                                                                     health = "WARNING";
                                                                                                                                                         diagnosis = "Repeated high-risk activity detected.";
                                                                                                                                                             recommendation =
                                                                                                                                                                   "Review affected sources and increase monitoring.";
                                                                                                                                                                     }

                                                                                                                                                                       if (blocked.length >= 3) {
                                                                                                                                                                           health = "ATTENTION_REQUIRED";
                                                                                                                                                                               diagnosis = "Multiple temporary restrictions detected.";
                                                                                                                                                                                   recommendation =
                                                                                                                                                                                         "Investigate recurring sources before increasing restrictions.";
                                                                                                                                                                                           }

                                                                                                                                                                                             const report = {
                                                                                                                                                                                                 agent: "Solvix IT Agent",
                                                                                                                                                                                                     status: health,
                                                                                                                                                                                                         diagnosis,
                                                                                                                                                                                                             recommendation,
                                                                                                                                                                                                                 statistics: {
                                                                                                                                                                                                                       events_checked: events.length,
                                                                                                                                                                                                                             high_risk: highRisk.length,
                                                                                                                                                                                                                                   blocked_events: blocked.length
                                                                                                                                                                                                                                       },
                                                                                                                                                                                                                                           execution_time_ms: Date.now() - started,
                                                                                                                                                                                                                                               timestamp: new Date().toISOString()
                                                                                                                                                                                                                                                 };

                                                                                                                                                                                                                                                   console.log(JSON.stringify(report));

                                                                                                                                                                                                                                                     return new Response(
                                                                                                                                                                                                                                                         JSON.stringify(report),
                                                                                                                                                                                                                                                             {
                                                                                                                                                                                                                                                                   status: 200,
                                                                                                                                                                                                                                                                         headers: { "Content-Type": "application/json" }
                                                                                                                                                                                                                                                                             }
                                                                                                                                                                                                                                                                               );
                                                                                                                                                                                                                                                                               });
