import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const plans: Record<string, number> = { Scout: 50000, Momentum: 150000, Quant: 350000 };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const anon = Deno.env.get("SUPABASE_ANON_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    if (!anon || !url) return json({ error: "Supabase function configuration is incomplete" }, 503);

    const caller = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: { user }, error: userErr } = await caller.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const plan = String(body.plan || "");
    const path = body.path === "jobs" ? "jobs" : body.path === "forex" ? "forex" : null;
    const provider = body.provider === "airtel" ? "airtel" : body.provider === "mtn" ? "mtn" : null;
    let phone = String(body.phone || "").replace(/\s+/g, "");
    const amount = plans[plan];

    if (!amount || !path || !provider) return json({ error: "Invalid onboarding selection" }, 400);
    if (/^07\d{8}$/.test(phone)) phone = "256" + phone.slice(1);
    if (!/^256\d{9}$/.test(phone)) return json({ error: "Use a valid Uganda mobile number" }, 400);

    const secret = Deno.env.get("FLW_SECRET_KEY");
    if (!secret) return json({ error: "Payment gateway is not configured yet. Add FLW_SECRET_KEY to Supabase Edge Function secrets." }, 503);

    const tx_ref = "SOLVIX-" + crypto.randomUUID();
    const { error: insertErr } = await caller.from("onboarding_payments").insert({
      user_id: user.id, tx_ref, plan, chosen_path: path, amount, currency: "UGX",
      provider, phone_number: phone, status: "pending",
    });
    if (insertErr) return json({ error: insertErr.message }, 500);

    const resp = await fetch("https://api.flutterwave.com/v3/charges?type=mobile_money_uganda", {
      method: "POST",
      headers: { Authorization: "Bearer " + secret, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount, currency: "UGX", email: user.email, tx_ref, phone_number: phone,
        network: provider === "mtn" ? "MTN" : "AIRTEL",
        fullname: user.user_metadata?.full_name || user.email?.split("@")[0] || "Solvix User",
      }),
    });
    const data = await resp.json();

    if (!resp.ok || data?.status !== "success") {
      await caller.from("onboarding_payments").update({ status: "failed" }).eq("tx_ref", tx_ref);
      return json({ error: data?.message || "Mobile Money charge failed" }, 400);
    }

    return json({ ok: true, tx_ref });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Payment error" }, 500);
  }
});
