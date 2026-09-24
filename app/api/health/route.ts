import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("user_profiles").select("id").limit(1);
    if (error) {
      return NextResponse.json(
        { ok: false, service: "solvix-web", supabase: false, error: error.message, latency_ms: Date.now() - started },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { ok: true, service: "solvix-web", supabase: true, latency_ms: Date.now() - started },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, service: "solvix-web", supabase: false, error: error instanceof Error ? error.message : "health check failed", latency_ms: Date.now() - started },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
