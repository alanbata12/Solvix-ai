// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

// User-authenticated API for reading available earning opportunities.
export default {
  fetch: withSupabase({ auth: "user" }, async (_req, { supabase }) => {
    const { data, error } = await supabase
      .from("earning_opportunities")
      .select("*");

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  }),
};
