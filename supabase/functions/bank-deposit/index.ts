import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export default {
  fetch: withSupabase({ auth: "user" }, async (req, { supabase }) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("bank_deposits")
        .select("id, amount, currency, bank_reference, sender_name, note, status, verified_at, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
      return Response.json({ data }, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
    }

    let body: {
      amount?: number;
      currency?: string;
      bank_reference?: string;
      sender_name?: string;
      note?: string;
    };

    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
    }

    const amount = Number(body.amount);
    const currency = String(body.currency || "UGX").trim().toUpperCase();
    const bankReference = String(body.bank_reference || "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "Amount must be greater than zero" }, { status: 400, headers: corsHeaders });
    }

    if (!bankReference) {
      return Response.json({ error: "Bank reference is required" }, { status: 400, headers: corsHeaders });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return Response.json({ error: "Authenticated user required" }, { status: 401, headers: corsHeaders });
    }

    const { data, error } = await supabase
      .from("bank_deposits")
      .insert({
        user_id: userData.user.id,
        amount,
        currency,
        bank_reference: bankReference,
        sender_name: body.sender_name?.trim() || null,
        note: body.note?.trim() || null,
        status: "pending",
      })
      .select("id, amount, currency, bank_reference, sender_name, note, status, created_at")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }

    return Response.json({
      success: true,
      message: "Deposit submitted for verification",
      data,
    }, { status: 201, headers: corsHeaders });
  }),
};
