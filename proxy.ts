import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from "./lib/supabase/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
          }
        },
      },
    },
  );

  // getClaims verifies the JWT; do not use the unverified session cookie
  // for authorization decisions.
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  const path = request.nextUrl.pathname;

  const copyAuthResponse = (nextResponse: NextResponse) => {
    for (const cookie of response.cookies.getAll()) {
      nextResponse.cookies.set(cookie);
    }
    for (const header of ["cache-control", "expires", "pragma"]) {
      const value = response.headers.get(header);
      if (value) nextResponse.headers.set(header, value);
    }
    return nextResponse;
  };

  const redirect = (pathname: string) =>
    copyAuthResponse(NextResponse.redirect(new URL(pathname, request.url)));

  const protectedPath =
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/billing") ||
    path.startsWith("/jobs") ||
    path.startsWith("/forex") ||
    path.startsWith("/yta");

  if (protectedPath && !userId) return redirect("/login");
  if (path === "/login" && userId) return redirect("/jobs");

  if (userId && (path.startsWith("/dashboard") || path.startsWith("/yta") || path.startsWith("/onboarding"))) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarding_complete")
      .eq("id", userId)
      .maybeSingle();

    if (path.startsWith("/dashboard") || path.startsWith("/yta")) {
      if (!profile?.onboarding_complete) return redirect("/onboarding/choose");
    } else if (profile?.onboarding_complete) {
      return redirect("/jobs");
    }
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
