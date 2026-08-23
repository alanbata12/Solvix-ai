import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@18.5.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2026-07-29.dahlia",
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: cors });

  if (!Deno.env.get("STRIPE_SECRET_KEY")) {
    return new Response(JSON.stringify({ error: "Stripe is not configured" }), { status: 503, headers: cors });
  }

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const currency = String(body.currency ?? "usd").toLowerCase();
    const description = String(body.description ?? "Solvix service payment").slice(0, 200);
    const origin = String(body.origin ?? "https://solvix-ai.vercel.app");

    if (!Number.isInteger(amount) || amount < 100) {
      return new Response(JSON.stringify({ error: "amount must be an integer of at least 100 minor currency units" }), { status: 400, headers: cors });
    }
    if (!/^[a-z]{3}$/.test(currency)) {
      return new Response(JSON.stringify({ error: "invalid currency" }), { status: 400, headers: cors });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price_data: { currency, product_data: { name: description }, unit_amount: amount }, quantity: 1 }],
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
      metadata: { solvix_source: "dashboard" },
    });

    return new Response(JSON.stringify({ id: session.id, url: session.url }), { status: 200, headers: cors });
  } catch (error) {
    console.error("stripe-checkout error", error);
    return new Response(JSON.stringify({ error: "Unable to create checkout session" }), { status: 500, headers: cors });
  }
});
