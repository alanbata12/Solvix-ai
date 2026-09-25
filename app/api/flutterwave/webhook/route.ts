import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function validSignature(rawBody: string, request: Request, secret: string) {
  const legacy = request.headers.get("verif-hash");
  if (legacy) return safeEqual(legacy, secret);

  const signature = request.headers.get("flutterwave-signature");
  if (!signature) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("base64");
  return safeEqual(digest, signature);
}

function planSlug(plan: string) {
  return plan.toLowerCase();
}

function normalizedStatus(status: string) {
  const value = status.toLowerCase();
  if (value === "successful" || value === "success") return "SUCCESSFUL";
  if (value === "failed") return "FAILED";
  if (value === "cancelled" || value === "canceled") return "CANCELLED";
  return "UNKNOWN";
}

export async function POST(request: Request) {
  const secretHash = process.env.FLW_SECRET_HASH;
  const flwSecretKey = process.env.FLW_SECRET_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretHash || !flwSecretKey || !supabaseUrl || !serviceRoleKey) {
    console.error("Flutterwave webhook is missing server configuration");
    return json({ error: "Webhook not configured" }, 503);
  }

  const rawBody = await request.text();
  if (!validSignature(rawBody, request, secretHash)) {
    return json({ error: "Invalid webhook signature" }, 401);
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const data = payload?.data ?? {};
  const txRef = String(data.tx_ref ?? data.reference ?? "").trim();
  const providerId = data.id != null ? String(data.id) : null;
  if (!txRef) return json({ received: true, ignored: "missing transaction reference" });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Idempotent lookup: the same Flutterwave event may be delivered more than once.
  const { data: existing, error: lookupError } = await supabase
    .from("onboarding_payments")
    .select("id,user_id,plan,chosen_path,amount,currency,provider,status")
    .eq("tx_ref", txRef)
    .maybeSingle();

  if (lookupError) {
    console.error("onboarding_payments lookup failed", lookupError);
    return json({ error: "Database lookup failed" }, 500);
  }

  if (!existing) {
    // It is safer to acknowledge an unrelated event than to manufacture a payment row.
    return json({ received: true, ignored: "unknown transaction reference" });
  }

  // Never credit a wallet/subscription from an unverified webhook alone.
  if (providerId) {
    try {
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(providerId)}/verify`,
        {
          headers: {
            Authorization: `Bearer ${flwSecretKey}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      const verified = await verifyResponse.json();
      const verifiedData = verified?.data;
      const verifiedTxRef = String(verifiedData?.tx_ref ?? "");
      const verifiedStatus = String(verifiedData?.status ?? "");

      if (
        !verifyResponse.ok ||
        verifiedTxRef !== txRef ||
        verifiedData?.currency !== existing.currency ||
        Number(verifiedData?.amount) !== Number(existing.amount)
      ) {
        console.error("Flutterwave verification mismatch", {
          txRef,
          verifiedTxRef,
          verifiedStatus,
        });
        await supabase
          .from("onboarding_payments")
          .update({
            status: "failed",
            provider_transaction_id: providerId,
            updated_at: new Date().toISOString(),
          })
          .eq("tx_ref", txRef);
        return json({ received: true, status: "rejected" });
      }

      payload.data.status = verifiedStatus;
      payload.data.amount = verifiedData.amount;
      payload.data.currency = verifiedData.currency;
    } catch (error) {
      console.error("Flutterwave verification error", error);
      return json({ error: "Transaction verification failed" }, 502);
    }
  }

  const status = normalizedStatus(String(payload?.data?.status ?? "unknown"));
  const onboardingStatus =
    status === "SUCCESSFUL"
      ? "successful"
      : status === "FAILED"
        ? "failed"
        : status === "CANCELLED"
          ? "cancelled"
          : "pending";

  const { error: updateError } = await supabase
    .from("onboarding_payments")
    .update({
      status: onboardingStatus,
      provider_transaction_id: providerId,
      updated_at: new Date().toISOString(),
    })
    .eq("tx_ref", txRef);

  if (updateError) {
    console.error("onboarding_payments update failed", updateError);
    return json({ error: "Database update failed" }, 500);
  }

  const { error: ledgerError } = await supabase
    .from("solvix_transactions")
    .upsert(
      {
        reference_id: txRef,
        external_id: providerId,
        action: "create",
        amount: existing.amount,
        currency: existing.currency,
        phone: null,
        status,
        reason: "Flutterwave webhook",
        metadata: {
          provider: "flutterwave",
          event: payload?.event ?? null,
          plan: existing.plan,
          chosen_path: existing.chosen_path,
        },
        transaction_type: "FLUTTERWAVE_COLLECTION",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "reference_id" },
    );

  if (ledgerError) console.error("solvix_transactions ledger update failed", ledgerError);

  if (status === "SUCCESSFUL") {
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: existing.user_id,
          onboarding_complete: true,
          chosen_path: existing.chosen_path,
          subscription_tier: planSlug(existing.plan),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    if (profileError) console.error("user_profiles update failed", profileError);
  }

  return json({ received: true, tx_ref: txRef, status });
}

export async function GET() {
  return json({ service: "SOLVIX Flutterwave webhook", status: "online" });
}
