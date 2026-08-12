import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    Deno.serve(async () => {
      const started = Date.now();

        const checks: Record<string, unknown> = {};

          // Security Agent status
            const { count: securityEvents, error: securityError } =
                await supabase
                      .from("security_events")
                            .select("*", { count: "exact", head: true });

                              checks.security = {
                                  status: securityError ? "ERROR" : "ONLINE",
                                      events: securityEvents ?? 0
                                        };

                                          // Active security blocks
                                            const { count: activeBlocks, error: blockError } =
                                                await supabase
                                                      .from("security_blocks")
                                                            .select("*", { count: "exact", head: true })
                                                                  .eq("active", true)
                                                                        .gt("blocked_until", new Date().toISOString());

                                                                          checks.security_blocks = {
                                                                              status: blockError ? "ERROR" : "ONLINE",
                                                                                  active: activeBlocks ?? 0
                                                                                    };

                                                                                      const healthy = !securityError && !blockError;

                                                                                        return new Response(
                                                                                            JSON.stringify({
                                                                                                  agent: "Solvix Core",
                                                                                                        status: healthy ? "ONLINE" : "ATTENTION_REQUIRED",
                                                                                                              mode: "ORCHESTRATION",
                                                                                                                    agents: {
                                                                                                                            security: "ONLINE",
                                                                                                                                    it: "ONLINE",
                                                                                                                                            repair: "ONLINE"
                                                                                                                                                  },
                                                                                                                                                        checks,
                                                                                                                                                              execution_time_ms: Date.now() - started,
                                                                                                                                                                    timestamp: new Date().toISOString()
                                                                                                                                                                        }),
                                                                                                                                                                            {
                                                                                                                                                                                  status: healthy ? 200 : 500,
                                                                                                                                                                                        headers: {
                                                                                                                                                                                                "Content-Type": "application/json"
                                                                                                                                                                                                      }
                                                                                                                                                                                                          }
                                                                                                                                                                                                            );
                                                                                                                                                                                                            });
