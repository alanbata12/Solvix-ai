import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@18.5.0";
import { createClient } from "jsr:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", { apiVersion: "2026-07-29.dahlia" });
const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const signature = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!signature || !secret || !Deno.env.get("STRIPE_SECRET_KEY")) return new Response("Webhook not configured", { status: 503 });

  try {
    const payload = await req.text();
    const event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const amount = session.amount_total ?? 0;
      const currency = session.currency ?? "usd";
      await supabase.from("earning_transactions").upsert({
        source: "stripe",
        external_id: session.id,
        amount,
        currency,
        status: "confirmed",
        metadata: { payment_status: session.payment_status, customer_email: session.customer_details?.email ?? null },
      }, { onConflict: "external_id" });
    }
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("stripe-webhook error", error);
    return new Response("Invalid webhook", { status: 400 });
  }
});
