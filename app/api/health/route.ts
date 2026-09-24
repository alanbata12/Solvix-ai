import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { ok: true, service: "solvix-web", status: "healthy" },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
