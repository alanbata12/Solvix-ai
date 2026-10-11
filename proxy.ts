import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./lib/supabase/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
          if (headers) Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  const { data: { claims } } = await supabase.auth.getClaims();
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  const path = request.nextUrl.pathname;

  const copyAuthResponse = (nextResponse: NextResponse) => {
    for (const cookie of response.cookies.getAll()) nextResponse.cookies.set(cookie);
    for (const header of ["cache-control", "expires", "pragma"]) {
      const value = response.headers.get(header);
      if (value) nextResponse.headers.set(header, value);
    }
    return nextResponse;
  };
  const redirect = (pathname: string, params?: Record<string, string>) => {
    const url = new URL(pathname, request.url);
    Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
    return copyAuthResponse(NextResponse.redirect(url));
  };

  const protectedPath = ["/dashboard", "/onboarding", "/billing", "/jobs", "/forex", "/ail", "/yta"]
    .some((prefix) => path.startsWith(prefix));
  if (protectedPath && !userId) return redirect("/login");
  if (path === "/login" && userId) return redirect("/jobs");

  if (userId && (path.startsWith("/dashboard") || path.startsWith("/yta") || path.startsWith("/onboarding"))) {
    const { data: profile } = await supabase.from("user_profiles")
      .select("onboarding_complete").eq("id", userId).maybeSingle();
    if ((path.startsWith("/dashboard") || path.startsWith("/yta")) && !profile?.onboarding_complete) {
      return redirect("/onboarding/choose");
    }
    if (path.startsWith("/onboarding") && profile?.onboarding_complete) return redirect("/jobs");
  }

  // Stripe remains deliberately unconnected. Vertical access is granted only
  // from a trusted subscription record; never trust client-provided plan data.
  const vertical = path.startsWith("/forex") ? "FOREX" : path.startsWith("/ail") ? "AIL" : null;
  if (userId && vertical) {
    const { data: subscription, error } = await supabase.from("user_subscriptions")
      .select("plan_tier,status,active_until").eq("user_id", userId).eq("vertical", vertical).maybeSingle();
    const activeUntil = subscription?.active_until ? Date.parse(subscription.active_until) : null;
    const notExpired = activeUntil === null || (Number.isFinite(activeUntil) && activeUntil > Date.now());
    const validStatus = subscription?.status === "active" ||
      (subscription?.status === "trialing" && activeUntil !== null && activeUntil > Date.now());
    if (error || !subscription || !validStatus || !notExpired) {
      return redirect("/billing", {
        vertical,
        reason: error ? "subscription_setup_required" : "subscription_required",
      });
    }
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
