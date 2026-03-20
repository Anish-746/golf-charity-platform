// app/auth/callback/route.ts
// This is a Next.js Route Handler — a server-side endpoint, like an API route.
// It handles the GET request Supabase sends after email confirmation.

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Extract the 'code' parameter Supabase appended to the URL
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // Exchange the one-time code for a real session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session is now set — send user to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // If something went wrong, send them to login with an error
  return NextResponse.redirect(`${origin}/login?error=Could not confirm email`);
}
