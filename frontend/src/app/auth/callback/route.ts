import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase auth callback handler.
 * Supabase redirects here after Magic Link / OAuth with ?code=...
 * We exchange the code for a session (PKCE flow).
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has a profile — if not, go to onboarding
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("college_tier")
          .eq("user_id", session.user.id)
          .maybeSingle(); // Use maybeSingle() to handle 404 gracefully

        const hasProfile = !!profile?.college_tier;
        const destination = hasProfile ? "/dashboard" : "/onboarding";
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  // Error or no code — redirect to auth with error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
